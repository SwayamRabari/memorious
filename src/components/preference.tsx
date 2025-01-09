import { Popover, PopoverTrigger, PopoverContent } from './ui/popover';
import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from './ui/select';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Settings2 } from 'lucide-react';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Text, List, ListTree } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreferenceProps {
  responseLoading: boolean;
  lengthValue: number[];
  setLengthValue: (value: number[]) => void;
  lengthLabel: string;
  setLengthLabel: (label: string) => void;
  structure: string;
  setStructure: (structure: string) => void;
  tone: string;
  setTone: (tone: string) => void;
}

export default function Preference({
  responseLoading,
  lengthValue,
  setLengthValue,
  lengthLabel,
  setLengthLabel,
  structure,
  setStructure,
  tone,
  setTone,
}: PreferenceProps) {
  const [open, setOpen] = useState(false);

  const structureLabels: { [key: string]: string } = {
    paragraphs: 'Paragraphs',
    points: 'Points',
    normal: 'Normal',
  };

  function handleReset() {
    setLengthValue([50]);
    setLengthLabel('Medium');
    setStructure('normal');
    setTone('normal');
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          disabled={responseLoading}
          className="h-fit w-fit p-2 flex items-center justify-center transition-all duration-300"
        >
          <Settings2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-5 bg-background border-[1.5px] border-border rounded-xl flex flex-col gap-5">
        <div className="length">
          <div className="w-full flex justify-between mb-3">
            <Label htmlFor="length" className="font-semibold text-base">
              Length
            </Label>
            <Label
              htmlFor="length"
              className="font-semibold text-base text-muted-foreground"
            >
              {lengthLabel}
            </Label>
          </div>
          <Slider
            id="length"
            min={1}
            max={100}
            value={lengthValue}
            onValueChange={(value) => {
              setLengthValue(value);
              if (value[0] > 66) setLengthLabel('Long');
              else if (value[0] > 33) setLengthLabel('Medium');
              else setLengthLabel('Short');
            }}
          />
        </div>
        <div className="tone">
          <div className="w-full flex justify-between mb-1">
            <Label htmlFor="tone" className="font-semibold text-base">
              Tone
            </Label>
          </div>
          <Select
            name="tone"
            value={tone}
            onValueChange={(val) => setTone(val)}
            defaultValue="normal"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="concise">Concise</SelectItem>
                <SelectItem value="descriptive">Descriptive</SelectItem>
                <SelectItem value="practical">Practical</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="structure">
          <div className="w-full flex justify-between mb-1">
            <Label htmlFor="structure" className="font-semibold text-base">
              Structure
            </Label>
            <Label
              htmlFor="structure"
              className="font-semibold text-base text-muted-foreground"
            >
              {structureLabels[structure]}
            </Label>
          </div>
          <RadioGroup
            onValueChange={(value) => setStructure(value)}
            className="grid grid-cols-3 gap-2"
            value={structure}
          >
            <Label
              htmlFor="paragraphs"
              className={cn(
                'flex items-center justify-center rounded-md border border-muted bg-popover h-10',
                structure === 'paragraphs' && 'bg-secondary'
              )}
            >
              <RadioGroupItem
                value="paragraphs"
                id="paragraphs"
                className="sr-only"
              />
              <Text />
            </Label>
            <Label
              htmlFor="points"
              className={cn(
                'flex items-center justify-center rounded-md border border-muted bg-popover h-10',
                structure === 'points' && 'bg-secondary'
              )}
            >
              <RadioGroupItem value="points" id="points" className="sr-only" />
              <List />
            </Label>
            <Label
              htmlFor="normal"
              className={cn(
                'flex items-center justify-center rounded-md border border-muted bg-popover h-10',
                structure === 'normal' && 'bg-secondary'
              )}
            >
              <RadioGroupItem value="normal" id="normal" className="sr-only" />
              <ListTree />
            </Label>
          </RadioGroup>
        </div>
        <div className="flex justify-end gap-2 w-full">
          <Button
            className="w-full"
            variant={'secondary'}
            onClick={() => setOpen(false)}
          >
            Done
          </Button>
          <Button
            className="w-full"
            variant={'secondary'}
            onClick={handleReset}
          >
            Reset
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
