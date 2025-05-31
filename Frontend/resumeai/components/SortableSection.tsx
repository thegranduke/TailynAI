import React from 'react';
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface DragHandle {
  isDragging: boolean;
  dragHandleProps: {
    [key: string]: any;
    className: string;
  };
}

interface SortableItemProps {
  id: string | number;
  children: React.ReactNode;
}

const SortableItem = ({ id, children }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

interface SortableSectionProps {
  items: Array<{ id: string | number; [key: string]: any }>;
  onReorder: (newOrder: any[]) => void;
  renderItem: (item: any, handle: DragHandle) => React.ReactNode;
}

export function SortableSection({ items, onReorder, renderItem }: SortableSectionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      
      const newItems = [...items];
      const [movedItem] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, movedItem);
      
      onReorder(newItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-0">
          {items.map((item) => (
            <SortableItemWrapper
              key={item.id}
              id={item.id}
              renderItem={renderItem}
              item={item}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface SortableItemWrapperProps {
  id: string | number;
  item: any;
  renderItem: SortableSectionProps['renderItem'];
}

function SortableItemWrapper({ id, item, renderItem }: SortableItemWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined,
    position: 'relative' as const,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {renderItem(item, {
        isDragging,
        dragHandleProps: {
          ...listeners,
          className: "cursor-move text-[#666] hover:text-[#222] transition-colors",
        }
      })}
    </div>
  );
} 