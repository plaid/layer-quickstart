interface DebugCardProps {
  debugInfo: string;
}

const DebugCard: React.FC<DebugCardProps> = ({ debugInfo }) => {
  return (
    <div className="bg-gray-900 text-green-400 p-4 rounded-lg shadow-lg border border-gray-700 font-mono text-sm opacity-90">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Debug Info
        </h3>
      </div>
      <textarea
        readOnly
        value={debugInfo}
        className="w-full bg-gray-800 text-green-400 p-2 rounded border border-gray-700 font-mono text-xs resize-none focus:outline-none"
        rows={6}
      />
    </div>
  );
};

export default DebugCard;
