import PizZip from 'pizzip';
import { parseStringPromise, Builder } from 'xml2js';

/**
 * Fungsi untuk mengganti placeholder secara dinamis dan menambahkan gambar.
 * @param templateBuffer - Buffer dari template dokumen Word.
 * @param imageBuffer - Buffer dari gambar yang akan disisipkan.
 * @param data - Objek data dinamis yang akan menggantikan placeholder.
 * @returns Buffer yang berisi dokumen Word yang telah dimodifikasi.
 */
const generateReport = async (
  templateBuffer: Buffer,
  imageBuffer: Buffer,
  data: { [key: string]: string }
): Promise<Buffer> => {
  const zip = new PizZip(templateBuffer);
  const documentXml = zip.file('word/document.xml')?.asText();
  
  if (!documentXml) {
    throw new Error("Document XML tidak ditemukan di dalam template.");
  }

  const modifiedDocumentXml = await replacePlaceholdersAndAddImage(documentXml, data);
  zip.file('word/document.xml', modifiedDocumentXml);

  const imagePath = `word/media/${data.imageName}`;
  zip.file(imagePath, imageBuffer);

  await addImageRelationship(zip, 1, imagePath);

  return zip.generate({ type: 'nodebuffer' });
};

/**
 * Fungsi untuk mengganti placeholder berdasarkan data dinamis.
 * @param documentXml - String XML dari dokumen Word.
 * @param data - Objek data dinamis yang akan menggantikan placeholder.
 * @returns XML dokumen yang telah dimodifikasi.
 */
const replacePlaceholdersAndAddImage = async (
  documentXml: string,
  data: { [key: string]: string }
): Promise<string> => {
  const parsedXml = await parseStringPromise(documentXml);

  parsedXml['w:document']['w:body'][0]['w:p'].forEach((paragraph: any) => {
    paragraph['w:r']?.forEach((run: any) => {
      if (run['w:t']) {
        let textContent = run['w:t'][0];
        const placeholders = textContent.match(/{[^}]+}/g); // Temukan semua {variabel}
        if (placeholders) {
          placeholders.forEach((placeholder: string) => {
            const key = placeholder.replace(/{|}/g, ''); // Hilangkan tanda kurung {}
            if (data[key]) {
              textContent = textContent.replace(placeholder, data[key]);
            }
          });
          run['w:t'][0] = textContent; // Update nilai dalam XML
        }
      }
    });
  });

  const builder = new Builder();
  return builder.buildObject(parsedXml);
};

/**
 * Fungsi untuk menambahkan relasi gambar.
 * @param zip - Objek zip dari dokumen Word.
 * @param imageId - ID gambar yang unik.
 * @param imagePath - Path gambar di dalam dokumen.
 */
const addImageRelationship = async (
  zip: PizZip,
  imageId: number,
  imagePath: string
): Promise<void> => {
  const relsPath = 'word/_rels/document.xml.rels';
  const relsXml = zip.file(relsPath)?.asText();
  
  if (!relsXml) {
    throw new Error("Relasi gambar XML tidak ditemukan.");
  }

  const parsedRels = await parseStringPromise(relsXml);

  parsedRels.Relationships.Relationship.push({
    $: {
      Id: `rId${imageId}`,
      Type: 'http://schemas.openxmlformats-officedocument/2006/relationships/image',
      Target: imagePath,
    },
  });

  const builder = new Builder();
  const newRelsXml = builder.buildObject(parsedRels);
  zip.file(relsPath, newRelsXml);
};

export {
  generateReport,
};
