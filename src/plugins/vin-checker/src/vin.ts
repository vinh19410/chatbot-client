import { getCountry, getRegion } from './country-region';
import { getManufacturer } from './manufacturer';
import { getModelYear } from './year';

export interface VINInfo {
  // Tài liệu http://www.vr.org.vn/contents/Rules/Lists/Rules/Attachments/229/TCVN%206578-2000-VIN.pdf
  wmi: string; // 3 ký tự đầu
  vds: string; // 6 ký tự giữa
  vis: string; // 8 ký tự cuối
  modelYear: string; // Ký tự thứ 10 thể hiện Model năm
  manufacturer?: string;
}

export interface VINDecoded {
  vin: string;
  isValid: boolean;
  message?: string; // báo lỗi
  info?: {
    region: string;
    country: string;
    modelYear: string;
    manufacturer: string;
  };
}

export const validateVIN = (vin: string) => {
  if (typeof vin !== 'string') {
    return {
      isValid: false,
      error: 'VIN phải là chuỗi ký tự',
    };
  }

  vin = vin.toUpperCase();

  if (vin.length !== 17) {
    return {
      isValid: false,
      error: 'VIN phải đủ 17 ký tự',
    };
  }
  // Regex: Validates that a VIN consists of 17 characters and doesn't contain I,O,Q
  if (!vin.match(/^[A-HJ-NPR-Z0-9]{17}$/)) {
    return {
      isValid: false,
      error: 'VIN chỉ chứa chữ cái và số trừ các ký tự I, O và Q',
    };
  }

  return {
    isValid: true,
  };
};

// Spit VIN to three sections based on ISO3779
export const splitVIN = (vin: string): VINInfo => {
  vin = vin.toUpperCase();
  return {
    wmi: vin.substring(0, 3),
    vds: vin.substring(3, 9),
    vis: vin.substring(9, 17),
    modelYear: vin.substring(9, 10),
  };
};

export const decodeVIN = (vin: string): VINDecoded => {
  vin = vin.toUpperCase();

  const validatedVIN = validateVIN(vin);
  if (!validatedVIN.isValid) {
    return {
      vin,
      isValid: false,
      message: validatedVIN.error,
    };
  }

  const split = splitVIN(vin);
  const region = getRegion(split.wmi);
  const country = getCountry(split.wmi);
  const modelYear = getModelYear(vin);
  const manufacturer = getManufacturer(split.wmi);

  return {
    vin,
    isValid: true,
    info: {
      region,
      country,
      modelYear,
      manufacturer,
    },
  };
};
