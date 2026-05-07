import * as QRCode from 'qrcode';

export const generateQRCodeBuffer = async (text: string): Promise<Buffer> => {
  try {
    const buffer = await QRCode.toBuffer(text, {
      type: 'png',
      margin: 1,
      width: 500,
    });
    return buffer;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};
