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
    <div
      className="space-y-3 rounded-[18px] border p-4"
      style={{
        backgroundColor: "var(--surface-primary)",
        borderColor: "var(--outline-variant)"
      }}
    >
      <div className="flex items-center justify-between">
        <label className="block text-base font-semibold"
               style={{ color: "var(--foreground-primary)" }}>
          检查更新
        </label>
        <span className="text-xs"
              style={{ color: "var(--foreground-secondary)" }}>
          v{appVersion}
        </span>
      </div>
      <button
        onClick={onCheckUpdate}
        disabled={isCheckingUpdate}
        className="w-full rounded-xl font-semibold text-sm transition-colors"
        style={
          isCheckingUpdate
            ? { backgroundColor: "var(--secondary-container)", color: "#9E9E9E", cursor: "not-allowed", padding: "10px 16px" }
            : { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)", padding: "10px 16px" }
        }
      >
        {isCheckingUpdate ? "检查中..." : "检查更新"}
      </button>
      {updateStatus && (
        <div
          className="text-xs p-2 rounded-xl"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground-secondary)" }}
        >
          {updateStatus}
        </div>
      )}
      {releaseInfo && (
        <div
          className="rounded-2xl p-3 space-y-2"
          style={{ backgroundColor: "var(--surface-mid)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm font-semibold"
                 style={{ color: "var(--foreground-primary)" }}>
              {releaseNotesTitle}
            </div>
            {releaseInfo.publishedAt && (
              <div className="text-[11px] text-right"
                   style={{ color: "var(--foreground-secondary)" }}>
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
            style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground-primary)" }}
          >
            {releaseInfo.notes || "暂无更新说明"}
          </div>
        </div>
      )}
      {updateUrl && (
        <button
          onClick={onOpenReleasePage}
          className="w-full rounded-xl font-semibold text-sm transition-colors"
          style={{ backgroundColor: "var(--primary)", color: "var(--on-primary)", padding: "10px 16px" }}
        >
          前往下载页
        </button>
      )}
    </div>

    <div className="space-y-3">
      <button
        onClick={onToggleUpdateSection}
        className="w-full flex items-center justify-between rounded-[18px] border text-sm font-semibold transition-colors"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--outline-variant)",
          color: "var(--foreground-primary)",
          padding: "14px 16px"
        }}
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
              style={{ backgroundColor: "var(--surface-mid)" }}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold"
                     style={{ color: "var(--foreground-primary)" }}>
                  课表软更新
                </div>
                {remoteUpdatedAt && (
                  <span className="text-xs"
                        style={{ color: "var(--foreground-secondary)" }}>
                    更新时间 {remoteUpdatedAt}
                  </span>
                )}
              </div>
              <button
                onClick={onSoftUpdateSchedule}
                disabled={isSoftUpdating}
                className="w-full rounded-xl font-semibold text-sm transition-colors"
                style={
                  isSoftUpdating
                    ? { backgroundColor: "var(--secondary-container)", color: "#9E9E9E", cursor: "not-allowed", padding: "10px 16px" }
                    : { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)", padding: "10px 16px" }
                }
              >
                {isSoftUpdating ? "更新中..." : "软更新课表"}
              </button>
              {softUpdateStatus && (
                <div
                  className="text-xs p-2 rounded-xl"
                  style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground-secondary)" }}
                >
                  {softUpdateStatus}
                </div>
              )}
              <p className="text-xs leading-relaxed"
                 style={{ color: "var(--foreground-secondary)" }}>
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
