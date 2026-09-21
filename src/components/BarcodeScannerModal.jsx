import React, { useState, useEffect } from 'react';
import { Modal } from './Modal.jsx';
import { Camera, Scan, CheckCircle, Search, Sparkles } from 'lucide-react';
import { usePOS } from '../context/POSContext.jsx';

export const BarcodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const { products } = usePOS();
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(true);
  const [lastScannedItem, setLastScannedItem] = useState(null);

  const handleSimulateScan = (prod) => {
    setLastScannedItem(prod);
    onScanSuccess(prod);
    setTimeout(() => {
      setLastScannedItem(null);
    }, 1500);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const matched = products.find(p => 
      p.barcode === manualCode.trim() || 
      p.sku.toLowerCase() === manualCode.trim().toLowerCase()
    );

    if (matched) {
      handleSimulateScan(matched);
      setManualCode('');
    } else {
      alert(`No product found with Barcode/SKU: ${manualCode}`);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Barcode & QR Code Scanner" maxWidth="max-w-xl">
      <div className="space-y-6">
        {/* Animated Laser Scanner Box */}
        <div className="relative h-48 rounded-2xl bg-slate-950 border-2 border-dashed border-sky-500/40 flex flex-col items-center justify-center overflow-hidden shadow-inner">
          {/* Laser Scanning Line Animation */}
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-glow-sky animate-bounce" style={{ animationDuration: '2s' }}></div>

          <div className="flex flex-col items-center gap-2 text-slate-400 z-10">
            <Camera className="w-10 h-10 text-sky-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300">Point Camera or USB Scanner at Barcode</span>
            <span className="text-[10px] text-slate-400">Supports standard EAN-13, UPC, SKU barcodes</span>
          </div>

          {lastScannedItem && (
            <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-md flex items-center justify-center gap-3 z-20 animate-fade-in">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <div>
                <div className="text-xs text-emerald-300 font-bold">Scanned Successfully!</div>
                <div className="text-sm font-semibold text-white">{lastScannedItem.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Manual Barcode Input */}
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Scan className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Enter or scan barcode / SKU (e.g. 5012345678901)..."
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 font-semibold text-xs text-white transition-colors flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>

        {/* Quick Test Barcode Clicker */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Click any item barcode below to test instant scan:</span>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {products.map(p => (
              <button
                key={p.id}
                onClick={() => handleSimulateScan(p)}
                className="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-sky-300">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">Barcode: {p.barcode} | SKU: {p.sku}</div>
                </div>
                <span className="px-2 py-1 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/30">
                  Scan Item
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
