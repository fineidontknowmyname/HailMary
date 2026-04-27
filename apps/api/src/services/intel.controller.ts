import { Request, Response } from 'express';
import { IntelService } from '../services/intel.service';
import { catchAsync } from '../middleware/errorHandler';

export const IntelController = {
  getAllIntel: catchAsync(async (req: Request, res: Response) => {
    const rawIntel = await IntelService.getCuratedIntel();
    
    // Process the data before sending it to the client (e.g., building safe URLs)
    const processedIntel = rawIntel.map(intel => ({
      ...intel,
      redirect_url: IntelService.buildYouTubeUrl(intel) || intel.link
    }));

    res.status(200).json({
      success: true,
      count: processedIntel.length,
      data: processedIntel
    });
  }),
};