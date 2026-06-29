import React, { useEffect, useState } from 'react';
import { getRewards, createReward, updateReward, deleteReward, getPurchases } from '../api/market';
import type { Reward } from '../utils/mockDb';
import {
  ShoppingBag,
  Plus,
  Coins,
  Package,
  History,
  Edit2,
  Trash2,
  X,
  PlusCircle,
} from 'lucide-react';

export const Market: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editRewardItem, setEditRewardItem] = useState<Reward | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [coinPrice, setCoinPrice] = useState('100');
  const [stock, setStock] = useState('10');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rList, pList] = await Promise.all([
        getRewards(),
        getPurchases(),
      ]);
      setRewards(rList);
      setPurchases(pList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createReward({
        name,
        description,
        image: image || undefined,
        coinPrice: Number(coinPrice),
        stock: Number(stock),
      });
      setCreateOpen(false);
      setName('');
      setDescription('');
      setImage('');
      setCoinPrice('100');
      setStock('10');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRewardItem) return;
    try {
      await updateReward(editRewardItem._id, {
        name,
        description,
        image: image || undefined,
        coinPrice: Number(coinPrice),
        stock: Number(stock),
      });
      setEditRewardItem(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Ushbu mukofotni do\'kondan o\'chirib tashlamoqchimisiz?')) {
      await deleteReward(id);
      await loadData();
    }
  };

  const openEdit = (reward: Reward) => {
    setEditRewardItem(reward);
    setName(reward.name);
    setDescription(reward.description);
    setImage(reward.image || '');
    setCoinPrice(String(reward.coinPrice));
    setStock(String(reward.stock));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Coin Market Do'koni</h1>
          <p className="text-muted-foreground">O'quvchilar koinlariga sotib olishlari mumkin bo'lgan mukofotlar catalog boshqaruvi.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Sovg'a Qo'shish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Rewards listing */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-primary" />
            Do'kondagi sovg'alar
          </h3>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : rewards.length === 0 ? (
            <p className="text-sm text-muted-foreground">Do'kon bo'sh.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rewards.map((r) => (
                <div key={r._id} className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-primary/50 transition-colors">
                  <div className="aspect-[16/10] w-full bg-secondary overflow-hidden">
                    <img src={r.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm">{r.name}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.description}</p>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3 mt-3 text-xs font-semibold">
                      <span className="flex items-center gap-1 text-yellow-600">
                        <Coins className="w-3.5 h-3.5" />
                        {r.coinPrice} Coins
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Package className="w-3.5 h-3.5" />
                        Omborda: {r.stock} ta
                      </span>
                    </div>

                    <div className="flex justify-end gap-1.5 pt-2">
                      <button
                        onClick={() => openEdit(r)}
                        className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Purchases logs feed */}
        <div className="lg:col-span-1 bg-card border rounded-xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <History className="w-4 h-4 text-primary" />
            Xaridlar Tarixi
          </h3>

          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : purchases.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Hali hech narsa sotib olinmagan.</p>
          ) : (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
              {purchases.map((p) => (
                <div key={p._id} className="p-3 bg-secondary/35 rounded-lg border text-xs space-y-1 hover:border-border transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold block">{p.studentName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(p.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>{p.rewardName}</span>
                    <span className="text-yellow-600 font-bold flex items-center gap-0.5">
                      -{p.coinPrice} <Coins className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Create / Edit Reward Modal dialog */}
      {(createOpen || editRewardItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">
                {editRewardItem ? 'Mukofotni Tahrirlash' : 'Yangi Mukofot Sovg\'a Qo\'shish'}
              </h3>
              <button
                onClick={() => {
                  setCreateOpen(false);
                  setEditRewardItem(null);
                }}
                className="p-1 rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editRewardItem ? handleEditSubmit : handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Mukofot nomi</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. InFast Hoody"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tavsif</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Mahsulot haqida batafsil ma'lumot..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Rasm (Image URL)</label>
                <input
                  type="text"
                  placeholder="E.g. https://domain.com/hoodie.jpg"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Koin narxi (Coins)</label>
                  <input
                    type="number"
                    required
                    value={coinPrice}
                    onChange={(e) => setCoinPrice(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Ombordagi soni</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false);
                    setEditRewardItem(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
