import { useTranslation } from 'react-i18next';
import { useToolOperation, ToolType } from '@app/hooks/tools/shared/useToolOperation';
import { createStandardErrorHandler } from '@app/utils/toolErrorHandler';
import { CTPSParameters, defaultParameters } from '@app/hooks/tools/ctps/useCTPSParameters';

// CTPS documents must be under 5MB for Brazilian government systems
const CTPS_TARGET_SIZE = '5MB';

export const buildCTPSFormData = (parameters: CTPSParameters, file: File): FormData => {
  const formData = new FormData();
  formData.append("fileInput", file);

  // Always use file size mode with 5MB target for CTPS
  formData.append("expectedOutputSize", CTPS_TARGET_SIZE);

  // Also set optimization level for aggressive compression
  formData.append("optimizeLevel", parameters.optimizationLevel.toString());

  // Grayscale conversion for maximum compression
  formData.append("grayscale", parameters.grayscale.toString());

  return formData;
};

// Static configuration object
export const ctpsOperationConfig = {
  toolType: ToolType.singleFile,
  buildFormData: buildCTPSFormData,
  operationType: 'ctps',
  endpoint: '/api/v1/misc/compress-pdf', // Reuses existing compress endpoint
  filePrefix: 'ctps_',
  defaultParameters,
} as const;

export const useCTPSOperation = () => {
  const { t } = useTranslation();

  return useToolOperation<CTPSParameters>({
    ...ctpsOperationConfig,
    filePrefix: t('ctps.filenamePrefix', 'ctps') + '_',
    getErrorMessage: createStandardErrorHandler(t('ctps.error.failed', 'Failed to compress CTPS document. The file may be too large to compress to 5MB.'))
  });
};
