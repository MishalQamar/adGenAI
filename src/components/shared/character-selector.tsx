'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { CrownIcon, UploadIcon } from 'lucide-react';
import Image from 'next/image';

interface CharacterSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Character {
  id: string;
  name: string;
  imageUrl: string;
}

const MOCK_CHARACTERS: Character[] = [
  {
    id: '1',
    name: '@grace',
    imageUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  },
  {
    id: '2',
    name: '@zoe',
    imageUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  },
  {
    id: '3',
    name: '@chris',
    imageUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
  },
  {
    id: '4',
    name: '@ben',
    imageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
  {
    id: '5',
    name: '@alex',
    imageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  },
  {
    id: '6',
    name: '@mia',
    imageUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop',
  },
  {
    id: '7',
    name: '@chloe',
    imageUrl:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop',
  },
  {
    id: '8',
    name: '@sophia',
    imageUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop',
  },
  {
    id: '9',
    name: '@emma',
    imageUrl:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop',
  },
];

export function CharacterSelector({
  open,
  onOpenChange,
}: CharacterSelectorProps) {
  return (
    <div>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Characters
            </DialogTitle>
            <DialogDescription>
              Select a character to use in your ad generation.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <Tabs
            defaultValue="Library"
            className="flex flex-col flex-1 min-h-0"
          >
            <TabsList className="h-10 p-1">
              <TabsTrigger
                className="flex items-center gap-2"
                value="Library"
              >
                <CrownIcon className="size-4 text-amber-500" />
                Library
              </TabsTrigger>
              <TabsTrigger
                className="flex items-center gap-2"
                value="my-characters"
              >
                <UploadIcon className="size-4" />
                My Characters
              </TabsTrigger>
            </TabsList>
            {/* Tabs Content */}
            <TabsContent value="Library">
              <div className="grid grid-cols-5 gap-6 max-h-[500px] overflow-y-auto p-2">
                {MOCK_CHARACTERS.map((character) => (
                  <div
                    key={character.id}
                    className="group relative flex flex-col cursor-pointer"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden border border-border/50 transition-all group-hover:ring-2 group-hover:ring-primary/50">
                      <Image
                        src={character.imageUrl}
                        alt={character.name}
                        sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 16vw"
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <span className="text-sm text-center text-muted-foreground group-hover:text-foreground transition-colors">
                      {character.name}
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="my-characters">
              my characters
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
