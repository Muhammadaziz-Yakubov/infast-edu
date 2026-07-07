import os
import asyncio
import logging
import random
import sys
from aiohttp import web
import aiohttp
from dotenv import load_dotenv
from telethon import TelegramClient, events, types

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(os.getcwd(), "logs", "telegram_client.log") if os.path.exists("logs") else "telegram_client.log")
    ]
)

# Load configuration
load_dotenv()

API_ID = int(os.getenv("API_ID", 0))
API_HASH = os.getenv("API_HASH", "")
PHONE = os.getenv("PHONE", "")
PORT = int(os.getenv("TELEGRAM_CLIENT_PORT", 5001))
HOST = os.getenv("TELEGRAM_CLIENT_HOST", "127.0.0.1")
BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:5000")
MIN_DELAY = float(os.getenv("MIN_DELAY", 5.0))
MAX_DELAY = float(os.getenv("MAX_DELAY", 15.0))

if not API_ID or not API_HASH or not PHONE:
    logging.error("Missing required environment variables: API_ID, API_HASH, PHONE")
    sys.exit(1)

# Ensure sessions directory exists
os.makedirs("sessions", exist_ok=True)
session_path = os.path.join("sessions", "assistant")

# Initialize Telethon Client
client = TelegramClient(session_path, API_ID, API_HASH)

async def shutdown():
    logging.info("Shutting down microservice...")
    await client.disconnect()
    await asyncio.sleep(1)
    os._exit(0)

# Define routes
routes = web.RouteTableDef()

@routes.get("/status")
async def get_status(request):
    try:
        if not client.is_connected():
            return web.json_response({"connected": False, "authorized": False})
        
        authorized = await client.is_user_authorized()
        if not authorized:
            return web.json_response({"connected": True, "authorized": False})
            
        me = await client.get_me()
        return web.json_response({
            "connected": True,
            "authorized": True,
            "id": str(me.id),
            "first_name": me.first_name or "",
            "last_name": me.last_name or "",
            "username": me.username or "",
            "phone": me.phone or PHONE
        })
    except Exception as e:
        logging.error(f"Error in /status: {e}")
        return web.json_response({"error": str(e)}, status=500)

@routes.post("/logout")
async def logout(request):
    try:
        logging.info("Logging out...")
        if client.is_connected():
            await client.log_out()
            await client.disconnect()
            
        # Clean up session files
        for f in os.listdir("sessions"):
            if f.startswith("assistant.session"):
                try:
                    os.remove(os.path.join("sessions", f))
                except Exception as ex:
                    logging.warning(f"Could not remove session file {f}: {ex}")
                    
        logging.info("Successfully logged out and session files cleaned.")
        asyncio.create_task(shutdown())
        return web.json_response({"success": True, "message": "Successfully logged out. Client shutting down."})
    except Exception as e:
        logging.error(f"Error in /logout: {e}")
        return web.json_response({"error": str(e)}, status=500)

@routes.post("/send")
async def send_message(request):
    try:
        data = await request.json()
        chat_id = data.get("chat_id")
        text = data.get("text")
        
        if not chat_id or not text:
            return web.json_response({"error": "Missing chat_id or text"}, status=400)
            
        try:
            target = int(chat_id)
        except ValueError:
            target = chat_id
            
        logging.info(f"Sending message to {target}: {text[:30]}...")
        sent_msg = await client.send_message(target, text)
        
        return web.json_response({
            "success": True,
            "message_id": f"{sent_msg.chat_id}_{sent_msg.id}",
            "date": sent_msg.date.isoformat()
        })
    except Exception as e:
        logging.error(f"Error in /send: {e}")
        return web.json_response({"error": str(e)}, status=500)

# Telegram Event Handlers
@client.on(events.NewMessage(incoming=True))
async def handle_incoming_message(event):
    # Only process private chats (no channels, no groups)
    if not event.is_private:
        return
        
    try:
        sender = await event.get_sender()
        if not sender:
            return
            
        # Ignore bots
        if hasattr(sender, "bot") and sender.bot:
            return
            
        me = await client.get_me()
        if sender.id == me.id:
            # Ignore self-messages (e.g. Saved Messages)
            return

        logging.info(f"Incoming message from {sender.id} ({sender.username or sender.first_name}): {event.text[:50]}")

        # Assemble webhook payload
        payload = {
            "message_id": f"{event.chat_id}_{event.id}",
            "chat_id": str(event.chat_id),
            "sender_id": str(sender.id),
            "sender_username": sender.username or "",
            "sender_first_name": sender.first_name or "",
            "sender_last_name": sender.last_name or "",
            "text": event.text or "",
            "is_contact": getattr(sender, "contact", False) or False,
            "date": event.date.isoformat()
        }

        # Send to Node.js backend
        async with aiohttp.ClientSession() as session:
            async with session.post(f"{BACKEND_URL}/api/telegram/incoming", json=payload) as resp:
                if resp.status == 200:
                    res_data = await resp.json()
                    
                    if res_data.get("action") == "reply":
                        reply_text = res_data.get("text")
                        
                        # Apply human-like delay
                        delay = random.uniform(MIN_DELAY, MAX_DELAY)
                        logging.info(f"Delaying reply by {delay:.2f} seconds...")
                        
                        # Show "typing" status while waiting
                        async with client.action(event.chat_id, "typing"):
                            await asyncio.sleep(delay)
                            
                        # Send the reply
                        sent_msg = await client.send_message(event.chat_id, reply_text)
                        logging.info(f"Reply sent to {event.chat_id}")
                        
                        # Notify backend that message was sent
                        sent_payload = {
                            "message_id": f"{sent_msg.chat_id}_{sent_msg.id}",
                            "chat_id": str(sent_msg.chat_id),
                            "sender_id": str(me.id),
                            "sender_username": me.username or "",
                            "sender_first_name": "Me",
                            "sender_last_name": "",
                            "text": reply_text,
                            "date": sent_msg.date.isoformat()
                        }
                        await session.post(f"{BACKEND_URL}/api/telegram/sent", json=sent_payload)
                    else:
                        logging.info(f"Message from {sender.id} ignored or no action requested.")
                else:
                    logging.error(f"Backend returned non-200 status: {resp.status}")
    except Exception as e:
        logging.error(f"Error handling incoming message: {e}")

async def start_client():
    logging.info("Starting Telegram Client...")
    try:
        # Prompt for code/password if not authorized (interactive terminal setup)
        await client.start(phone=PHONE)
        logging.info("Telegram Client is authorized and connected!")
        
        # Log self details
        me = await client.get_me()
        logging.info(f"Logged in as: {me.first_name} (@{me.username or 'NoUsername'})")
    except Exception as e:
        logging.critical(f"Failed to start Telegram Client: {e}")
        sys.exit(1)

async def start_web_server():
    app = web.Application()
    app.add_routes(routes)
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, HOST, PORT)
    await site.start()
    logging.info(f"Microservice HTTP server running on http://{HOST}:{PORT}")
    return runner

async def main():
    # Make sure logs directory exists
    os.makedirs("logs", exist_ok=True)
    
    # Start Telethon Client
    await start_client()
    
    # Start aiohttp HTTP Server
    runner = await start_web_server()
    
    # Keep the service running
    try:
        while True:
            await asyncio.sleep(3600)
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        await runner.cleanup()
        await client.disconnect()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logging.info("Process interrupted by user. Exiting.")
        sys.exit(0)
