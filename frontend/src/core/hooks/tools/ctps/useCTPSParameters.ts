import { BaseParameters } from '@app/types/parameters';
import { useBaseParameters, BaseParametersHook } from '@app/hooks/tools/shared/useBaseParameters';

export interface CTPSParameters extends BaseParameters {
  // CTPS has a fixed 5MB target, but we expose optimization level for fine-tuning
  optimizationLevel: number;
  grayscale: boolean;
  applyOcr: boolean;
  ocrLanguage: string;
}

export const defaultParameters: CTPSParameters = {
  optimizationLevel: 7, // Aggressive default for image-heavy CTPS documents
  grayscale: false,
  applyOcr: false,
  ocrLanguage: 'por', // Portuguese default for Brazilian documents
};

export type CTPSParametersHook = BaseParametersHook<CTPSParameters>;

export const useCTPSParameters = (): CTPSParametersHook => {
  return useBaseParameters({
    defaultParameters,
    endpointName: 'compress-pdf', // Reuses existing compress endpoint
    validateFn: (params) => {
      // Optimization level must be between 5-9 for CTPS (aggressive compression)
      return params.optimizationLevel >= 5 && params.optimizationLevel <= 9;
    },
  });
};
