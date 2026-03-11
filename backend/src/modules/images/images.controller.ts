import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  BadRequestException,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiConsumes,
  ApiQuery,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { Multer } from 'multer';
import { ImageService } from './image.service';
import { ImageFilterDto } from './dto/image-filter.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { UploadImageDto, UploadImageBodyDto } from './dto/upload-image.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { RatingUpdateResponseDto } from './dto/rating-update-response.dto';
import { LqipResponseDto } from './dto/lqip-response.dto';
import { ImageResponseDto } from './dto/image-response.dto';
import { Image } from '../../entities/image.entity';

/**
 * Controller for image-related REST API endpoints.
 * Provides endpoints for listing, retrieving, uploading, and managing images.
 */
@ApiTags('images')
@Controller('api/images')
export class ImagesController {
  constructor(private readonly imageService: ImageService) {}

  /**
   * List images with filtering, sorting, and pagination
   * GET /api/images
   */
  @Get()
  @ApiOperation({
    summary: 'List images with filtering, sorting, and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of images',
    type: PaginatedResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async listImages(
    @Query() filters: ImageFilterDto,
  ): Promise<PaginatedResponseDto<ImageResponseDto>> {
    const { data, total } = await this.imageService.findAll(filters);

    const items = data.map((image) => this.toResponseDto(image));

    return PaginatedResponseDto.create(
      items,
      filters.page || 1,
      filters.pageSize || 10,
      total,
    );
  }

  /**
   * Get processed image with format negotiation
   * GET /api/images/:id
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get processed image with format negotiation' })
  @ApiHeader({
    name: 'Accept',
    description:
      'Desired image format (e.g., image/webp, image/png, image/jpeg). Server will return the best matching format based on browser support.',
    example: 'image/webp',
    required: false,
  })
  @ApiParam({ name: 'id', description: 'Image UUID', format: 'uuid' })
  @ApiQuery({
    name: 'width',
    required: false,
    description: 'Target width in pixels',
  })
  @ApiResponse({ status: 200, description: 'Returns processed image binary' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('width') widthQuery: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<Buffer> {
    const image = await this.imageService.findById(id);

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    const width = widthQuery ? parseInt(widthQuery, 10) : image.width;
    const acceptHeader = req.headers.accept || '';

    const processedImage = await this.imageService.getProcessedImage(
      id,
      width,
      undefined,
      acceptHeader,
    );

    res.set({
      'Content-Type': processedImage.contentType,
      'Cache-Control': 'public, max-age=31536000',
      Vary: 'Accept',
    });

    return processedImage.buffer;
  }

  /**
   * Get image metadata as JSON
   * GET /api/images/:id/metadata
   */
  @Get(':id/metadata')
  @ApiOperation({ summary: 'Get image metadata as JSON' })
  @ApiParam({ name: 'id', description: 'Image UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Returns image metadata',
    type: ImageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getMetadata(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ImageResponseDto> {
    const image = await this.imageService.findById(id);

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return this.toResponseDto(image);
  }

  /**
   * Upload a new image
   * POST /api/images/upload
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new BadRequestException(
              'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiOperation({ summary: 'Upload a new image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to upload',
    type: UploadImageBodyDto,
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Image uploaded successfully',
    type: ImageResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file or format not supported',
  })
  async uploadImage(
    @UploadedFile() file: Multer.File,
    @Body() body: UploadImageDto,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const image = await this.imageService.processUpload(file, body.genre);

    return this.toResponseDto(image);
  }

  /**
   * Get Low Quality Image Placeholder (LQIP)
   * GET /api/images/:id/lqip
   */
  @Get(':id/lqip')
  @ApiOperation({ summary: 'Get Low Quality Image Placeholder' })
  @ApiParam({ name: 'id', description: 'Image UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Returns LQIP base64 data',
    type: LqipResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getLqip(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LqipResponseDto> {
    const image = await this.imageService.findById(id);

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return { lqipBase64: image.lqipBase64 };
  }

  /**
   * Update image rating
   * PATCH /api/images/:id/rating
   */
  @Patch(':id/rating')
  @ApiOperation({ summary: 'Update image rating (1-5)' })
  @ApiParam({ name: 'id', description: 'Image UUID', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Rating updated',
    type: RatingUpdateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid rating value' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async updateRating(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ): Promise<RatingUpdateResponseDto> {
    const image = await this.imageService.findById(id);

    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    const updatedImage = await this.imageService.updateRating(
      id,
      updateRatingDto.rating,
    );

    if (!updatedImage) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }

    return {
      id: updatedImage.id,
      rating: updatedImage.rating,
      updatedAt: updatedImage.createdAt,
    };
  }

  /**
   * Convert Image entity to ImageResponseDto
   * @param image - Image entity
   * @returns ImageResponseDto
   */
  private toResponseDto(image: Image): ImageResponseDto {
    return {
      id: image.id,
      filename: image.filename,
      genre: image.genre,
      rating: image.rating,
      aspectRatio: image.aspectRatio,
      dominantColor: image.dominantColor,
      lqipBase64: image.lqipBase64,
      width: image.width,
      height: image.height,
      createdAt: image.createdAt,
    };
  }
}
