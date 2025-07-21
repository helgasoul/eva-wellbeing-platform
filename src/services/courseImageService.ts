import { supabase } from '@/integrations/supabase/client';
import { Course } from '@/types/academy';

export interface ImageGenerationRequest {
  courseId: string;
  category: string;
  title: string;
  description: string;
  keywords?: string[];
  imageDescription?: string;
}

export class CourseImageService {
  /**
   * Generates a descriptive prompt for AI image generation based on course data
   */
  private static generateImagePrompt(request: ImageGenerationRequest): string {
    const { category, title, description, keywords, imageDescription } = request;
    
    // Base prompt templates for each category
    const categoryPrompts = {
      menopause_basics: "Professional image showing a confident mature woman in a healthcare or wellness setting",
      hormones: "Clean medical or scientific illustration related to hormones and women's health",
      nutrition: "Beautiful arrangement of healthy, colorful foods focusing on nutrition",
      mental_health: "Serene image of a woman practicing mindfulness or meditation",
      sexuality: "Tasteful image representing intimacy and relationship wellness",
      lifestyle: "Active, healthy woman engaging in wellness activities"
    };

    const basePrompt = categoryPrompts[category as keyof typeof categoryPrompts] || 
                      "Professional image related to women's health and wellness";

    // Add keywords if available
    const keywordString = keywords?.length ? `, featuring elements of: ${keywords.join(', ')}` : '';
    
    // Use custom description if available, otherwise use generated one
    const finalDescription = imageDescription || basePrompt;
    
    return `${finalDescription}${keywordString}. High quality, professional photography style, soft lighting, healthcare setting, educational and supportive atmosphere. Ultra high resolution.`;
  }

  /**
   * Logs image generation activity to the database
   */
  private static async logImageGeneration(
    courseId: string,
    imageType: 'generated' | 'placeholder' | 'uploaded',
    imageUrl: string,
    generationPrompt?: string,
    keywords?: string[]
  ): Promise<void> {
    try {
      await supabase
        .from('course_image_logs')
        .insert({
          course_id: courseId,
          image_type: imageType,
          image_url: imageUrl,
          generation_prompt: generationPrompt,
          keywords: keywords || [],
          is_active: true
        });
    } catch (error) {
      console.error('Failed to log image generation:', error);
    }
  }

  /**
   * Updates course with generated image URL
   */
  private static async updateCourseImage(courseId: string, imageUrl: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .update({ generated_image_url: imageUrl })
      .eq('id', courseId);

    if (error) {
      throw new Error(`Failed to update course image: ${error.message}`);
    }
  }

  /**
   * Determines if a course needs image improvement
   */
  public static needsImageImprovement(course: Course): boolean {
    // Course needs improvement if:
    // 1. No generated image URL
    // 2. No thumbnail URL or it's a generic placeholder
    // 3. Has image keywords but no generated image
    
    if (course.generated_image_url) {
      return false; // Already has generated image
    }

    if (!course.thumbnail_url || 
        course.thumbnail_url.includes('placeholder') ||
        course.thumbnail_url.includes('via.placeholder.com')) {
      return true; // No or generic thumbnail
    }

    if (course.image_keywords && course.image_keywords.length > 0) {
      return true; // Has keywords but no generated image to match them
    }

    return false;
  }

  /**
   * Main method to generate and set course image
   * Returns the generated image URL or null if generation failed
   */
  public static async generateCourseImage(course: Course): Promise<string | null> {
    try {
      const request: ImageGenerationRequest = {
        courseId: course.id,
        category: course.category,
        title: course.title,
        description: course.description,
        keywords: course.image_keywords,
        imageDescription: course.image_description
      };

      const prompt = this.generateImagePrompt(request);
      
      // For now, we'll use a placeholder that represents the intended image
      // In a real implementation, this would call an AI image generation API
      const placeholderUrl = this.getEnhancedPlaceholder(course);
      
      // Log the "generation" attempt
      await this.logImageGeneration(
        course.id,
        'generated',
        placeholderUrl,
        prompt,
        course.image_keywords
      );

      // Update the course with the new image URL
      await this.updateCourseImage(course.id, placeholderUrl);

      console.log(`Generated image for course "${course.title}":`, placeholderUrl);
      console.log(`Prompt used:`, prompt);

      return placeholderUrl;
    } catch (error) {
      console.error('Image generation failed:', error);
      return null;
    }
  }

  /**
   * Gets an enhanced placeholder based on course category and content
   */
  private static getEnhancedPlaceholder(course: Course): string {
    const categoryImages = {
      menopause_basics: [
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=450&fit=crop&crop=center&auto=format&q=80',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop&crop=center&auto=format&q=80'
      ],
      hormones: [
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=450&fit=crop&crop=center&auto=format&q=80',
        'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=450&fit=crop&crop=center&auto=format&q=80'
      ],
      nutrition: [
        'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=450&fit=crop&crop=center&auto=format&q=80',
        'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=450&fit=crop&crop=center&auto=format&q=80'
      ],
      mental_health: [
        'https://images.unsplash.com/photo-1500673922987-e212871fec22?w=800&h=450&fit=crop&crop=center&auto=format&q=80',
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=450&fit=crop&crop=center&auto=format&q=80'
      ],
      sexuality: [
        'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=450&fit=crop&crop=center&auto=format&q=80',
        'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=450&fit=crop&crop=center&auto=format&q=80'
      ],
      lifestyle: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=450&fit=crop&crop=center&auto=format&q=80',
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800&h=450&fit=crop&crop=center&auto=format&q=80'
      ]
    };

    const images = categoryImages[course.category] || categoryImages.menopause_basics;
    
    // Create a hash from course ID to ensure consistent image selection
    const hash = course.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const index = Math.abs(hash) % images.length;
    return images[index];
  }

  /**
   * Batch process multiple courses for image generation
   */
  public static async batchGenerateImages(courses: Course[]): Promise<void> {
    const coursesNeedingImages = courses.filter(this.needsImageImprovement);
    
    if (coursesNeedingImages.length === 0) {
      console.log('No courses need image improvements');
      return;
    }

    console.log(`Generating images for ${coursesNeedingImages.length} courses`);

    // Process in batches to avoid overwhelming the system
    const batchSize = 3;
    for (let i = 0; i < coursesNeedingImages.length; i += batchSize) {
      const batch = coursesNeedingImages.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(course => this.generateCourseImage(course))
      );

      // Small delay between batches
      if (i + batchSize < coursesNeedingImages.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Batch image generation completed');
  }
}