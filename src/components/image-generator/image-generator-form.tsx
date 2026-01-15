'use client';

import {
  IMAGE_GENERATION_MODELS,
  IMAGE_ASPECT_RATIOS,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from '@/lib/constants';
import { ImageSchema, imageSchema } from '@/lib/schema';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { CrownIcon, Loader2, UploadIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRef, useState } from 'react';
import { CharacterSelector } from '../shared/character-selector';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { uploadToImageKit } from '@/lib/imagekit.client';
import { useAction, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export const ImageGeneratorForm = () => {
  const { user } = useUser();
  const currentUser = useQuery(api.users.current);
  const getUploadAuth = useAction(
    api.characters.actions.getUploadAuth
  );
  const [isCharacterSelectorOpen, setIsCharacterSelectorOpen] =
    useState(false);
  const [isUploadingObject, setIsUploadingObject] = useState(false);

  const objectImageInputRef = useRef<HTMLInputElement>(null);

  const generateImage = useAction(
    api.image_generations.actions.generate
  );

  const form = useForm<ImageSchema>({
    resolver: zodResolver(imageSchema),
    defaultValues: {
      model: IMAGE_GENERATION_MODELS[0].value,
      aspectRatio: IMAGE_ASPECT_RATIOS[0].value,
      prompt: '',
      characterImageUrl: undefined,
      objectImageUrl: undefined,
    },
  });

  async function onSubmit(values: ImageSchema) {
    const credits = currentUser?.credits ?? 0;
    if (credits < 1) {
      toast.error(
        'You do not have enough credits to generate an image'
      );
      return;
    }

    try {
      await generateImage(values);
      toast.success('Image is being generated...');
    } catch (error) {
      toast.error('Failed to generate image');
    }
  }

  const isSubmitting = form.formState.isSubmitting;

  const characterImageUrl = useWatch({
    control: form.control,
    name: 'characterImageUrl',
  });
  const objectImageUrl = useWatch({
    control: form.control,
    name: 'objectImageUrl',
  });

  const handleObjectImageSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    //validate file size (5MB max)
    if (file.size > MAX_FILE_SIZE) {
      toast.error('mAX iMAGE SIZE IS 5MB');
      return;
    }
    //validate file type (jpeg, png, jpg)
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('INVALID FILE TYPE');
      return;
    }
    //upload to imagekit
    handleObjectImageUpload(file);
  };

  const handleObjectImageUpload = async (file: File) => {
    setIsUploadingObject(true);
    if (!user) {
      toast.error('You must be logged in to create a character');
      setIsUploadingObject(false);
      return;
    }
    try {
      const authParams = await getUploadAuth();

      const uploadResult = await uploadToImageKit(
        file,
        `objects/${user.id}`,
        `${file.name.replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
        authParams
      );

      // update the form value with the object image url
      form.setValue('objectImageUrl', uploadResult.url, {
        shouldDirty: true,

        shouldValidate: true,
      });
    } catch (error) {
      toast.error('Failed to upload object');
      console.error(error);
    } finally {
      setIsUploadingObject(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-md p-4 h-full">
      <div className="flex flex-col gap-2 ">
        <h2 className="text-2xl font-bold tracking-tight">
          Generate Images
        </h2>
        <p className="text-muted-foreground">
          Create stunning images with AI
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Model Select */}
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_GENERATION_MODELS.map((model) => (
                        <SelectItem
                          key={model.value}
                          value={model.value}
                        >
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reference section */}
          <FormField
            control={form.control}
            name="characterImageUrl"
            render={() => (
              <FormItem>
                <FormLabel>Reference Images</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Character Options */}
                    <div
                      onClick={() => setIsCharacterSelectorOpen(true)}
                      className="relative flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:bg-accent/50 aspect-square border-muted-foreground/25 overflow-hidden"
                    >
                      {characterImageUrl ? (
                        <>
                          <Image
                            src={characterImageUrl}
                            alt="Character"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue(
                                'characterImageUrl',
                                undefined,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                }
                              );
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-all z-10"
                          >
                            <X className="size-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <>
                          <CrownIcon className="size-6 mb-2 text-amber-500" />
                          <span className="text-xs font-medium">
                            Character
                          </span>
                        </>
                      )}
                    </div>
                    {/* Object Options */}
                    <div
                      onClick={() => {
                        if (!isUploadingObject) {
                          objectImageInputRef.current?.click();
                        }
                      }}
                      className="relative flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:bg-accent/50 aspect-square border-muted-foreground/25 overflow-hidden"
                    >
                      <input
                        type="file"
                        ref={objectImageInputRef}
                        className="hidden"
                        accept="image/jpeg, image/png, image/jpg"
                        onChange={handleObjectImageSelect}
                      />
                      {objectImageUrl ? (
                        <>
                          <Image
                            src={objectImageUrl}
                            alt="Object"
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, 25vw"
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              form.setValue(
                                'objectImageUrl',
                                undefined,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                }
                              );
                              if (objectImageInputRef.current) {
                                objectImageInputRef.current.value =
                                  '';
                              }
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 transition-all z-10"
                          >
                            <X className="size-4 text-white" />
                          </button>
                        </>
                      ) : isUploadingObject ? (
                        <Loader2 className="size-6 mb-2 text-muted-foreground animate-spin" />
                      ) : (
                        <>
                          <UploadIcon className="size-6 mb-2 text-muted-foreground" />
                          <span className="text-xs font-medium">
                            Object
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Prompt Input */}
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe your image"
                    className="min-h-[120px] resize-none"
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aspect ratio */}
          <FormField
            control={form.control}
            name="aspectRatio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aspect Ratio</FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select an aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {IMAGE_ASPECT_RATIOS.map((aspectRatio) => (
                        <SelectItem
                          key={aspectRatio.value}
                          value={aspectRatio.value}
                        >
                          {aspectRatio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Generate Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Generate Image'
            )}
          </Button>
        </form>
      </Form>
      <CharacterSelector
        open={isCharacterSelectorOpen}
        onOpenChange={setIsCharacterSelectorOpen}
        onSelect={(characterUrl) => {
          form.setValue('characterImageUrl', characterUrl, {
            shouldDirty: true,
            shouldValidate: true,
          });
          setIsCharacterSelectorOpen(false);
        }}
      />
    </div>
  );
};
