'use client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMemo, useState } from 'react';
import { CharacterListView } from './character-list-view';
import { Character } from './character-card';
import { CreateCharacterView } from './create-character-view';
import { useQuery } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { CreditsPurchaseModal } from '../credits-purchase-modal';

export interface CharacterSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (characterUrl: string) => void;
}

export function CharacterSelector({
  open,
  onOpenChange,
  onSelect,
}: CharacterSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'list' | 'create'>('list');

  const systemCharactersData = useQuery(
    api.characters.queries.listSystemCharacters
  );
  const userCharactersData = useQuery(
    api.characters.queries.listUserCharacters
  );

  //Map convex data to Character interface
  const systemCharacters: Character[] = useMemo(
    () =>
      systemCharactersData?.map((character) => ({
        id: character._id,
        name: character.name,
        imageUrl: character.imageUrl,
      })) || [],
    [systemCharactersData]
  );

  const userCharacters: Character[] = useMemo(
    () =>
      userCharactersData?.map((character) => ({
        id: character._id,
        name: character.name,
        imageUrl: character.imageUrl,
      })) || [],
    [userCharactersData]
  );
  const [activeTab, setActiveTab] = useState<string>('Library');

  const filteredCharacters: Character[] = useMemo(() => {
    const characters =
      activeTab === 'Library' ? systemCharacters : userCharacters;
    return characters.filter((character) =>
      character.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeTab, searchQuery, systemCharacters, userCharacters]);

  const handleCreateSuccess = () => {
    setView('list');
    setActiveTab('my-characters');
  };

  const subscription = useQuery(
    api.subscriptions.queries.getUserSubscriptions
  );

  /*  if (open && subscription?.subscription?.status !== 'active') {
    if (subscription === undefined) return null;
    return (
      <CreditsPurchaseModal open={open} onOpenChange={onOpenChange} />
    );
  } */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] bg-background/95 backdrop-blur-xl border-border/50">
        {view === 'list' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Characters
              </DialogTitle>
              <DialogDescription>
                Select a character to use in your ad generation.
              </DialogDescription>
            </DialogHeader>

            <CharacterListView
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              characters={filteredCharacters}
              onSelect={onSelect}
              onNewCharacter={() => setView('create')}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </>
        ) : (
          <CreateCharacterView
            onBack={() => setView('list')}
            onSuccess={handleCreateSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

// Export types for external use
export type { Character } from './character-card';
