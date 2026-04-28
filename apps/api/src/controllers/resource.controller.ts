import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_KEY as string
);

export const uploadResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { title } = req.body;

    if (!file || !title) {
      res.status(400).json({ error: 'File and title are required' });
      return;
    }

    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    // Insert metadata into resources table
    const { data: dbData, error: dbError } = await supabase
      .from('resources')
      .insert([
        {
          title,
          file_url: publicUrlData.publicUrl,
          file_path: filePath,
          content_type: file.mimetype,
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    res.status(200).json({ success: true, resource: dbData });
  } catch (error: any) {
    console.error('Upload Error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload resource' });
  }
};
