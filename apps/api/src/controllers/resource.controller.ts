import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

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

    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

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

export const contributeResource = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, link, type, description } = req.body;

    if (!title || !link || !type || !description) {
      res.status(400).json({ success: false, error: 'Title, link, type, and description are required.' });
      return;
    }

    const { error } = await supabase.from('resources').insert([
      { title, link, type, description, status: 'pending' }
    ]);

    if (error) throw error;

    res.status(201).json({ success: true });
  } catch (error: any) {
    console.error('Contribute Resource Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to submit resource' });
  }
};
