import { useState } from "react";
import { Stack, Text, Checkbox, Divider, Alert, Badge, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { CTPSParameters } from "@app/hooks/tools/ctps/useCTPSParameters";

interface CTPSSettingsProps {
  parameters: CTPSParameters;
  onParameterChange: <K extends keyof CTPSParameters>(key: K, value: CTPSParameters[K]) => void;
  disabled?: boolean;
}

const CTPSSettings = ({ parameters, onParameterChange, disabled = false }: CTPSSettingsProps) => {
  const { t } = useTranslation();
  const [isSliding, setIsSliding] = useState(false);

  return (
    <Stack gap="md">
      {/* Info Alert */}
      <Alert variant="light" color="blue" title={t('ctps.info.title', 'CTPS Compression')}>
        <Text size="sm">
          {t('ctps.info.description', 'This tool compresses your CTPS document to under 5MB, the maximum size accepted by Brazilian government systems (eSocial, etc.).')}
        </Text>
      </Alert>

      <Divider />

      {/* Target Size Badge */}
      <Group>
        <Text size="sm" fw={500}>{t('ctps.targetSize.label', 'Target Size')}:</Text>
        <Badge color="green" size="lg">5 MB</Badge>
      </Group>

      <Divider />

      {/* Compression Level */}
      <Stack gap="sm">
        <Text size="sm" fw={500}>{t('ctps.compressionLevel.label', 'Compression Level')}</Text>
        <div style={{ position: 'relative' }}>
          <input
            type="range"
            min="5"
            max="9"
            step="1"
            value={parameters.optimizationLevel}
            onChange={(e) => onParameterChange('optimizationLevel', parseInt(e.target.value))}
            onMouseDown={() => setIsSliding(true)}
            onMouseUp={() => setIsSliding(false)}
            onTouchStart={() => setIsSliding(true)}
            onTouchEnd={() => setIsSliding(false)}
            disabled={disabled}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: `linear-gradient(to right, #228be6 0%, #228be6 ${(parameters.optimizationLevel - 5) / 4 * 100}%, #e9ecef ${(parameters.optimizationLevel - 5) / 4 * 100}%, #e9ecef 100%)`,
              outline: 'none',
              WebkitAppearance: 'none'
            }}
          />
          {isSliding && (
            <div style={{
              position: 'absolute',
              top: '-25px',
              left: `${(parameters.optimizationLevel - 5) / 4 * 100}%`,
              transform: 'translateX(-50%)',
              background: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '12px',
              color: '#228be6',
              whiteSpace: 'nowrap'
            }}>
              {parameters.optimizationLevel}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6c757d' }}>
          <span>{t('ctps.compressionLevel.moderate', 'Moderate')} (5)</span>
          <span>{t('ctps.compressionLevel.maximum', 'Maximum')} (9)</span>
        </div>
        <Text size="xs" c="dimmed" style={{ marginTop: '4px' }}>
          {parameters.optimizationLevel <= 6 && t('ctps.compressionLevel.hint.moderate', 'Good balance between quality and size reduction')}
          {parameters.optimizationLevel >= 7 && parameters.optimizationLevel <= 8 && t('ctps.compressionLevel.hint.aggressive', 'Aggressive compression - some quality loss')}
          {parameters.optimizationLevel >= 9 && t('ctps.compressionLevel.hint.maximum', 'Maximum compression - noticeable quality reduction')}
        </Text>
      </Stack>

      <Divider />

      {/* Options */}
      <Stack gap="sm">
        <Text size="sm" fw={500}>{t('ctps.options.title', 'Options')}</Text>

        <Checkbox
          checked={parameters.grayscale}
          onChange={(event) => onParameterChange('grayscale', event.currentTarget.checked)}
          disabled={disabled}
          label={t("ctps.grayscale.label", "Convert to grayscale")}
          description={t("ctps.grayscale.description", "Significantly reduces file size but removes colors")}
        />
      </Stack>

      {/* File size warning */}
      <Alert variant="light" color="yellow" title={t('ctps.warning.title', 'Note')}>
        <Text size="xs">
          {t('ctps.warning.description', 'If your file cannot be compressed to under 5MB, try enabling grayscale or using a higher compression level. Very large files with many high-resolution images may not achieve the 5MB target.')}
        </Text>
      </Alert>
    </Stack>
  );
};

export default CTPSSettings;
