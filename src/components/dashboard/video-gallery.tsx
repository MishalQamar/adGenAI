'use client';

import { usePaginatedQuery } from 'convex/react';
import {
  Copy,
  DownloadIcon,
  VideoIcon,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import Masonry from 'react-masonry-css';

import { api } from '../../../convex/_generated/api';
import { Skeleton } from '../ui/skeleton';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { PAGE_SIZE } from '@/lib/constants';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export const VideoGallery = () => {
  const { results, status, loadMore } = usePaginatedQuery(
    api.video_generations.queries.getPaginatedVideos,
    {},
    { initialNumItems: PAGE_SIZE }
  );
  const videos = results;

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && status === 'CanLoadMore') {
      loadMore(PAGE_SIZE);
    }
  }, [inView, status, loadMore]);

  if (status === 'LoadingFirstPage') {
    return (
      <div className="h-full w-full overflow-y-auto pr-2 space-y-8">
        <div className="space-y-4 w-full">
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton
                key={index}
                className="w-full aspect-square rounded-md"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border rounded-md bg-muted/10 p-8 text-center">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <VideoIcon className="size-10 text-muted-foreground" />
        </div>
        <div className="mx-auto">
          <h3 className="text-lg font-semibold mb-72">
            No videos generated yet
          </h3>
          <p className="max-w-sm mx-auto text-muted-foreground">
            Select a model ,enter a prompt and click generate to see
            your creations here
          </p>
        </div>
      </div>
    );
  }

  //group videos by month and year
  const groupedVideos = videos.reduce((acc, video) => {
    const date = new Date(video.createdAt);
    const key = format(date, 'MMMM yyyy');
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(video);
    return acc;
  }, {} as Record<string, typeof videos>);

  const handleCopyPromt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard');
  };

  const handleDownloadVideo = async (videoUrl: string) => {
    try {
      //fetch the image a as blob
      const res = await fetch(videoUrl, { mode: 'cors' });
      const blob = await res.blob();

      //build filename
      const timestamp = new Date().getTime();
      const filename = `generated-video(${timestamp})`;

      const objectUrl = URL.createObjectURL(blob);

      //create a <a> tag to trigger the download
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      //cleanup the object url to free the memory
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      toast.success('Video downloaded successfully');
    } catch {
      toast.error('Failed to download video');
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto pr-2 space-y-8">
      {Object.entries(groupedVideos).map(
        ([dateGroup, groupedVideosData]) => (
          <div key={dateGroup} className="space-y-4">
            <h2 className="text-sm font-medium text-muted-foreground pl-1">
              {dateGroup}
            </h2>

            <Masonry
              breakpointCols={{
                default: 3,
                1280: 2,
                1024: 1,
              }}
              className="flex -ml-4"
              columnClassName="pl-4 bg-clipping-padding space-y-4"
            >
              {groupedVideosData.map(
                (video: (typeof videos)[number]) => (
                  <div
                    className="relative rounded-lg overflow-hidden border bg-muted/20 group"
                    key={video._id}
                  >
                    {video.status === 'processing' ? (
                      <div className="aspect-square ">
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          <span className="text-xs text-muted-foreground font-medium">
                            Generating...
                          </span>
                        </div>
                      </div>
                    ) : video.status === 'fail' ? (
                      <div className="aspect-square flex flex-col items-center justify-center gap-2 bg-destructive/10">
                        <ShieldAlert className="size-4 text-destructive" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Failed to generate
                        </span>
                      </div>
                    ) : video.status === 'success' &&
                      video.resultsVideoUrls ? (
                      <>
                        <video
                          src={video.resultsVideoUrls}
                          className="h-auto w-full object-cover block"
                          preload="metadata"
                          autoPlay
                          muted
                          loop
                          playsInline
                          disablePictureInPicture
                        />
                        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-8  bg-black/50 text-white border-0 hover:bg-black/70"
                            title="Download video"
                            onClick={() =>
                              video.resultsVideoUrls &&
                              handleDownloadVideo(
                                video.resultsVideoUrls
                              )
                            }
                          >
                            <DownloadIcon className="size-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="size-8  bg-black/50 text-white border-0 hover:bg-black/70"
                            title="Copy prompt"
                            onClick={() =>
                              handleCopyPromt(video.prompt)
                            }
                          >
                            <Copy className="size-4" />
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </div>
                )
              )}
            </Masonry>
          </div>
        )
      )}

      <div
        ref={ref}
        className="w-full flex items-center justify-center"
      >
        {status === 'LoadingMore' && (
          <div className="py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
};
