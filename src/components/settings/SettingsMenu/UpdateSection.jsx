import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const UpdateSection = ({
  appVersion,
  isCheckingUpdate,
  updateStatus,
  releaseInfo,
  releaseNotesTitle,
  formatReleasePublishedAt,
  updateUrl,
  onCheckUpdate,
  onOpenReleasePage,
  showUpdateSection,
  onToggleUpdateSection,
  isSoftUpdating,
  remoteUpdatedAt,
  softUpdateStatus,
  onSoftUpdateSchedule
}) => (
  <>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold" style={{ color: "#1C1B1F" }}>
          检查更新
        </label>
        <span className="text-xs" style={{ color: "#49454F" }}>
          v{appVersion}
        </span>
      </div>
      <button
        onClick={onCheckUpdate}
        disabled={isCheckingUpdate}
        className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
        style={
          isCheckingUpdate
            ? { backgroundColor: "#E8DEF8", color: "#9E9E9E", cursor: "not-allowed" }
            : { backgroundColor: "#E8DEF8", color: "#1D192B" }
        }
      >
        {isCheckingUpdate ? "检查中..." : "检查更新"}
      </button>
      {updateStatus && (
        <div
          className="text-xs p-2 rounded-xl"
          style={{ backgroundColor: "#ECE6F0", color: "#49454F" }}
        >
          {updateStatus}
        </div>
      )}
      {releaseInfo && (
        <div
          className="rounded-2xl p-3 space-y-2"
          style={{ backgroundColor: "#F3EDF7", border: "1px solid #CAC4D0" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-semibold" style={{ color: "#1C1B1F" }}>
              {releaseNotesTitle}
            </div>
            {releaseInfo.publishedAt && (
              <div className="text-[11px] text-right" style={{ color: "#49454F" }}>
                发布于 {formatReleasePublishedAt(releaseInfo.publishedAt)}
              </div>
            )}
          </div>
          {releaseInfo.isFallback && (
            <div
              className="rounded-xl px-2.5 py-2 text-xs"
              style={{ backgroundColor: "#FFF3CD", color: "#7D5700" }}
            >
              未找到当前版本说明，已显示最新版本说明。
            </div>
          )}
          <div
            className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl px-3 py-2 text-xs leading-6"
            style={{ backgroundColor: "#ECE6F0", color: "#1C1B1F" }}
          >
            {releaseInfo.notes || "暂无更新说明"}
          </div>
        </div>
      )}
      {updateUrl && (
        <button
          onClick={onOpenReleasePage}
          className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
          style={{ backgroundColor: "#6750A4", color: "#FFFFFF" }}
        >
          前往下载页
        </button>
      )}
    </div>

    <div className="space-y-3">
      <button
        onClick={onToggleUpdateSection}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
        style={{ backgroundColor: "#E8DEF8", color: "#1D192B" }}
      >
        <span>更新与发布</span>
        {showUpdateSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence>
        {showUpdateSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-2xl p-3 space-y-3"
              style={{ backgroundColor: "#F3EDF7", border: "1px solid #CAC4D0" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold" style={{ color: "#1C1B1F" }}>
                  课表软更新
                </div>
                {remoteUpdatedAt && (
                  <span className="text-xs" style={{ color: "#49454F" }}>
                    更新时间 {remoteUpdatedAt}
                  </span>
                )}
              </div>
              <button
                onClick={onSoftUpdateSchedule}
                disabled={isSoftUpdating}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                style={
                  isSoftUpdating
                    ? { backgroundColor: "#E8DEF8", color: "#9E9E9E", cursor: "not-allowed" }
                    : { backgroundColor: "#E8DEF8", color: "#1D192B" }
                }
              >
                {isSoftUpdating ? "更新中..." : "软更新课表"}
              </button>
              {softUpdateStatus && (
                <div
                  className="text-xs p-2 rounded-xl"
                  style={{ backgroundColor: "#ECE6F0", color: "#49454F" }}
                >
                  {softUpdateStatus}
                </div>
              )}
              <p className="text-xs" style={{ color: "#49454F" }}>
                点击后从远端拉取最新课表，检测到更新时会提示确认。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </>
);

export default UpdateSection;
