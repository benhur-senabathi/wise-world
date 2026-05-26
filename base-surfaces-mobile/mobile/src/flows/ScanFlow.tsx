import { useEffect, useRef } from 'react';
import { IconButton } from '@transferwise/components';
import { Cross, QrCode, Image as ImageIcon, Document } from '@transferwise/icons';
import { GlassCircle } from '../components/FlowHeader';

type Props = {
  onClose: () => void;
};

export function ScanFlow({ onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    window.parent.postMessage({ type: 'status-bar-style', light: true }, '*');
    return () => { window.parent.postMessage({ type: 'status-bar-style', light: false }, '*'); };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="scan-flow np-theme-personal--dark">
      <video ref={videoRef} className="scan-flow__video" autoPlay playsInline muted />
      <div className="scan-flow__overlay">
        <div className="scan-flow__header">
          <GlassCircle onClick={onClose} ariaLabel="Close">
            <span className="ios-glass-btn__icon"><Cross size={24} /></span>
          </GlassCircle>
          <GlassCircle ariaLabel="QR code">
            <span className="ios-glass-btn__icon"><QrCode size={24} /></span>
          </GlassCircle>
        </div>

        <div className="scan-flow__footer">
          <p className="scan-flow__description np-text-body-default">
            Scan, snap, or upload. AI will help process it, just confirm the details. <a className="scan-flow__link">Learn more</a>
          </p>
          <div className="scan-flow__actions">
            <div className="scan-flow__action">
              <IconButton size={48} priority={"secondary-neutral" as any} aria-label="Photo">
                <ImageIcon size={24} />
              </IconButton>
              <span className="scan-flow__action-label np-text-body-small">Photo</span>
            </div>
            <button className="scan-flow__capture" aria-label="Capture" />
            <div className="scan-flow__action">
              <IconButton size={48} priority={"secondary-neutral" as any} aria-label="Document">
                <Document size={24} />
              </IconButton>
              <span className="scan-flow__action-label np-text-body-small">Document</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
