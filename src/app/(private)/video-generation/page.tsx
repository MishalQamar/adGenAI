import { VideoGeneratorForm } from '@/components/video-generator/video-generator-form';
import { VideoPreviewArea } from '@/components/video-generator/video-preview';

export default function VideoGeneratorPage() {
  return (
    <div className="md:h-[calc(100vh-6rem)] h-auto p-4">
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Left Side */}

        <div className="w-full md:w-[360px] flex-none h-auto md:h-full md:overflow-y-auto">
          <VideoGeneratorForm />
        </div>

        {/* Right Side */}
        <div className="hidden md:flex flex-1 h-full overflow-y-auto">
          <VideoPreviewArea />
        </div>
      </div>
    </div>
  );
}
