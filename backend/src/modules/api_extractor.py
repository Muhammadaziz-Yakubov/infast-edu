import os
import json
import re

workspace_root = r"c:\Users\Muhammadaziz\Desktop\infast-edu"
backend_src = os.path.join(workspace_root, 'backend', 'src')

controller_files = []
for parent, dirs, files in os.walk(backend_src):
    for file in files:
        if file.endswith('.controller.ts'):
            controller_files.append(os.path.join(parent, file))

print(f"Found {len(controller_files)} controller files.")

api_inventory = []

for cf in controller_files:
    rel_path = os.path.relpath(cf, workspace_root)
    with open(cf, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Find @Controller('prefix')
    prefix_match = re.search(r'@Controller\([\'"](.*?)[\'"]\)', content)
    prefix = prefix_match.group(1) if prefix_match else ""

    # Let's extract endpoints
    # Endpoints are usually like:
    # @Get('path') or @Get()
    # @Post('path') or @Post()
    # @Patch('path') or @Patch()
    # @Delete('path') or @Delete()
    # @Roles(...) decorator
    
    # We will scan line by line to keep context (Roles, method, path)
    lines = content.splitlines()
    current_roles = []
    current_operation = ""
    
    for idx, line in enumerate(lines):
        line_strip = line.strip()
        
        # Check Roles
        roles_match = re.search(r'@Roles\((.*?)\)', line_strip)
        if roles_match:
            roles_str = roles_match.group(1)
            # Parse roles (e.g. Role.STUDENT, Role.SUPER_ADMIN)
            roles = [r.strip().replace('Role.', '') for r in roles_str.split(',')]
            current_roles = roles
        
        # Check ApiOperation
        op_match = re.search(r'@ApiOperation\(\{\s*summary:\s*[\'"](.*?)[\'"]', line_strip)
        if op_match:
            current_operation = op_match.group(1)

        # Check HTTP methods
        http_match = re.search(r'@(Get|Post|Patch|Put|Delete)\((.*?)\)', line_strip)
        if http_match:
            method = http_match.group(1).upper()
            subpath_raw = http_match.group(2).strip()
            
            # Clean up subpath (remove quotes)
            subpath = ""
            if subpath_raw:
                # might be '@Get(':id')'
                sm = re.match(r'^[\'"](.*?)[\'"]', subpath_raw)
                if sm:
                    subpath = sm.group(1)
            
            # Find the function name (usually on the next few lines)
            func_name = ""
            for next_idx in range(idx + 1, min(idx + 10, len(lines))):
                next_line = lines[next_idx].strip()
                if '(' in next_line and not next_line.startswith('@'):
                    # e.g., "create(@Body() dto: CreateDto) {"
                    func_match = re.match(r'([a-zA-Z0-9_]+)\s*\(', next_line)
                    if func_match:
                        func_name = func_match.group(1)
                        break
            
            full_path = f"/{prefix}"
            if subpath:
                full_path = f"/{prefix}/{subpath}".replace('//', '/')
            
            api_inventory.append({
                'controller': os.path.basename(cf),
                'file': rel_path,
                'method': method,
                'path': full_path,
                'roles': current_roles if current_roles else ["PUBLIC / USER"],
                'operation': current_operation,
                'handler': func_name
            })
            
            # Reset temporary tags for next endpoint
            current_roles = []
            current_operation = ""

output_path = os.path.join(workspace_root, 'repo_api_inventory.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(api_inventory, f, indent=2)

print(f"Saved {len(api_inventory)} API endpoints to repo_api_inventory.json")
