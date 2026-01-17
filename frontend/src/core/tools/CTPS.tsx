import { useTranslation } from "react-i18next";
import { createToolFlow } from "@app/components/tools/shared/createToolFlow";
import CTPSSettings from "@app/components/tools/ctps/CTPSSettings";
import { useCTPSParameters } from "@app/hooks/tools/ctps/useCTPSParameters";
import { useCTPSOperation } from "@app/hooks/tools/ctps/useCTPSOperation";
import { useBaseTool } from "@app/hooks/tools/shared/useBaseTool";
import { BaseToolProps, ToolComponent } from "@app/types/tool";

const CTPS = (props: BaseToolProps) => {
  const { t } = useTranslation();

  const base = useBaseTool(
    'ctps',
    useCTPSParameters,
    useCTPSOperation,
    props
  );

  return createToolFlow({
    files: {
      selectedFiles: base.selectedFiles,
      isCollapsed: base.hasResults,
      placeholder: t("ctps.files.placeholder", "Select your CTPS PDF document"),
    },
    steps: [
      {
        title: t("ctps.steps.settings", "Compression Settings"),
        isCollapsed: base.settingsCollapsed,
        onCollapsedClick: base.settingsCollapsed ? base.handleSettingsReset : undefined,
        content: (
          <CTPSSettings
            parameters={base.params.parameters}
            onParameterChange={base.params.updateParameter}
            disabled={base.endpointLoading}
          />
        ),
      },
    ],
    executeButton: {
      text: t("ctps.submit", "Compress to 5MB"),
      isVisible: !base.hasResults,
      loadingText: t("loading"),
      onClick: base.handleExecute,
      disabled: !base.params.validateParameters() || !base.hasFiles || !base.endpointEnabled,
    },
    review: {
      isVisible: base.hasResults,
      operation: base.operation,
      title: t("ctps.results.title", "Compression Results"),
      onFileClick: base.handleThumbnailClick,
      onUndo: base.handleUndo,
    },
  });
};

export default CTPS as ToolComponent;
