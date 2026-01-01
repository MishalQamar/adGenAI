import { ImageIcon } from 'lucide-react';

export const ImagePreview = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center border rounded-md bg-muted/10 p-8 text-center">
      <div className="bg-muted/30 p-6 rounded-full mb-4">
        <ImageIcon className="size-10 text-muted-foreground" />
      </div>
      <div className="mx-auto">
        <h3 className="text-lg font-semibold mb-72">
          No images generated yet
        </h3>
        <p className="max-w-sm mx-auto text-muted-foreground">
          Select a model ,enter a prompt and click generate to see
          your creations here
        </p>
      </div>
    </div>
  );
};
