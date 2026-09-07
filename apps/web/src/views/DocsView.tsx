import { PlatformDocViewer } from "../components/docs/PlatformDocViewer";

export function DocsView({ onCopyNotice }: { onCopyNotice: (msg: string) => void }) {
  return (
    <div className="w-full pt-2">
      <PlatformDocViewer onCopyNotice={onCopyNotice} />
    </div>
  );
}
