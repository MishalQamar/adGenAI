import { ImageGeneratorForm } from '@/components/image-generator/image-generator-form';
import { ImagePreview } from '@/components/image-generator/preview-area';

export default function ImageGeneratorPage() {
  return (
    <div className="md:h-[calc(100vh -6rem)] h-auto p-4">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Left Side */}

        <div className="w-full md:w-[360px] flex-none h-auto md:h-full md:overflow-y-auto">
          <ImageGeneratorForm />
        </div>

        {/* Right Side */}
        <div className="hidden md:flex flex-1 h-full overflow-y-auto">
          <ImagePreview />
        </div>
      </div>
    </div>
  );
}
