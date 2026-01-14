import { ImageGallery } from '@/components/dashboard/image-gallery';
import { VideoGallery } from '@/components/dashboard/video-gallery';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ImageIcon, VideoIcon } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-6 space-y-8 h-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Recent Generations</h1>
        <p>View latest AI-generated images and videos</p>

        <Tabs className="space-y-6" defaultValue="images">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger className="gap-2" value="images">
              <ImageIcon className="size-4" />
              Images
            </TabsTrigger>
            <TabsTrigger className="gap-2" value="videos">
              <VideoIcon className="size-4" />
              Videos
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="images"
            className="m-0 focus-visible:outline-none"
          >
            <ImageGallery />
          </TabsContent>
          <TabsContent
            value="videos"
            className="m-0 focus-visible:outline-none"
          >
            <VideoGallery />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
