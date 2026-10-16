import React from 'react';
import { PatientInfo, PrescriptionItem, StickerSize, HospitalConfig } from '../types/sticker';
import { StickerView } from './StickerView';

interface PrintSheetProps {
  patient: PatientInfo;
  items: PrescriptionItem[];
  stickerSize: StickerSize;
  copies: number;
  hospitalConfig?: HospitalConfig;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  patient,
  items,
  stickerSize,
  copies,
  hospitalConfig,
}) => {
  // Multiply items by copies
  const printableList: PrescriptionItem[] = [];
  for (let c = 0; c < copies; c++) {
    printableList.push(...items);
  }

  if (stickerSize === 'a4-sheet') {
    // Split into batches of 10 or 8 per A4 sheet
    const chunkSize = 10;
    const pages: PrescriptionItem[][] = [];
    for (let i = 0; i < printableList.length; i += chunkSize) {
      pages.push(printableList.slice(i, i + chunkSize));
    }

    return (
      <div className="hidden print:block print-only-container">
        {pages.map((pageItems, pageIdx) => (
          <div key={pageIdx} className="a4-sticker-page">
            <div className="a4-grid">
              {pageItems.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex justify-center">
                  <StickerView
                    patient={patient}
                    item={item}
                    size="a4-sheet"
                    itemIndex={idx}
                    totalItems={pageItems.length}
                    hospitalConfig={hospitalConfig}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Thermal roll mode (each sticker on its own page)
  return (
    <div className="hidden print:block print-only-container">
      {printableList.map((item, idx) => (
        <div key={`${item.id}-${idx}`} className="thermal-sticker-page flex items-center justify-center">
          <StickerView
            patient={patient}
            item={item}
            size={stickerSize}
            itemIndex={idx}
            totalItems={printableList.length}
            hospitalConfig={hospitalConfig}
          />
        </div>
      ))}
    </div>
  );
};
