import React, { useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

/* Hotbar Edit grid — the SAME 10 numbered tiles, draggable while Hotbar
   Edit Mode is ON. Tapping a tile opens the Hotbar Picker (assign /
   replace / remove); dragging a tile reorders ONLY the slot assignments —
   the underlying spell, item, or ability is never moved, duplicated, or
   consumed. No gameplay action can fire from this grid: taps are guarded
   so a completed drag never falls through as a tap. */
export default function HotbarEditGrid({ slots, labels, onReorder, onTap }) {
  const lastDrag = useRef(0);

  const handleTap = (i) => {
    if (Date.now() - lastDrag.current < 250) return; // a just-finished drag — not a tap
    onTap?.(i);
  };

  const onDragEnd = (result) => {
    lastDrag.current = Date.now();
    const { source, destination } = result;
    if (!destination || destination.index === source.index) return;
    const next = [...slots];
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    onReorder?.(next); // slot ORDER only — the canonical references move with it
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="hotbar-edit" type="GRID">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-5 md:grid-cols-2 gap-1.5"
          >
            {slots.map((slot, i) => (
              <Draggable key={String(i)} draggableId={`slot-${i}`} index={i}>
                {(drag, snapshot) => (
                  <div
                    ref={drag.innerRef}
                    {...drag.draggableProps}
                    {...drag.dragHandleProps}
                    onClick={() => handleTap(i)}
                    className={snapshot.isDragging ? "relative z-10" : ""}
                  >
                    <span
                      className={`ink-box relative flex w-full h-9 overflow-hidden select-none ${
                        slot ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
                      }`}
                      title={slot ? "Tap to assign / replace / remove — drag to reorder" : "Tap to assign"}
                    >
                      <span className="absolute left-1 top-0.5 text-[7px] font-fell text-[var(--ink-faint)] select-none">
                        {i + 1}
                      </span>
                      <span className="flex h-full w-full items-center justify-center px-0.5 pt-1">
                        <span className="w-full text-center text-[9px] leading-[1.1] break-words line-clamp-2">
                          {labels[i] || "—"}
                        </span>
                      </span>
                    </span>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}