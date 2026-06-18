import { useEffect, useState, useRef } from 'react';
import { api } from '../../api/client';
import FloorPlan3D from './FloorPlan3D';

const SNAP_GRID = 20;

export default function FloorPlanEditor() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [selectedLayoutId, setSelectedLayoutId] = useState(null);
  
  const [elements, setElements] = useState([]);
  const [dragging, setDragging] = useState(null);
  const [show3D, setShow3D] = useState(false);
  const planRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('floorPlanElements');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Automatically upgrade existing stages to the new massive dimensions
        const upgraded = parsed.map(el => {
          if (el.type === 'stage' && el.width === 200) {
            return { ...el, width: 360, height: 100 };
          }
          return el;
        });
        setElements(upgraded);
      } catch (e) {
        setElements([]);
      }
    }
  }, []);

  useEffect(() => {
    api('/events').then((evts) => {
      setEvents(evts);
      if (evts.length) setEventId(evts[0]._id);
    });
  }, []);

  useEffect(() => {
    if (eventId) {
      fetchPlans(eventId);
      const evt = events.find(e => e._id === eventId);
      if (evt) setSelectedLayoutId(evt.selectedLayoutId);
    }
  }, [eventId, events]);

  useEffect(() => {
    if (activePlan) {
      setElements(activePlan.elements || []);
    } else {
      setElements([]); // Clear if no active plan
    }
  }, [activePlan]);

  const fetchPlans = async (id) => {
    try {
      const fetchedPlans = await api(`/floor-plans/event/${id}`);
      setPlans(fetchedPlans);
      if (fetchedPlans.length > 0) {
        setActivePlan(fetchedPlans[0]);
      } else {
        setActivePlan(null);
        setElements([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const createNewPlan = async () => {
    const name = prompt('Enter a name for this layout:');
    if (!name) return;
    try {
      const newPlan = await api('/floor-plans', {
        method: 'POST',
        body: JSON.stringify({ eventId, name, elements: [] })
      });
      setPlans([...plans, newPlan]);
      setActivePlan(newPlan);
    } catch (e) {
      alert(e.message);
    }
  };

  const save = async () => {
    if (!activePlan) {
      const name = prompt('Enter a name for this new layout:');
      if (!name) return;
      try {
        const newPlan = await api('/floor-plans', {
          method: 'POST',
          body: JSON.stringify({ eventId, name, elements })
        });
        setPlans([...plans, newPlan]);
        setActivePlan(newPlan);
        alert('Layout saved successfully!');
      } catch (e) {
        alert(e.message);
      }
      return;
    }

    try {
      await api(`/floor-plans/${activePlan._id}`, { 
        method: 'PUT', 
        body: JSON.stringify({ elements }) 
      });
      setPlans(plans.map(p => p._id === activePlan._id ? { ...p, elements } : p));
      alert('Layout saved successfully!');
    } catch (e) {
      alert('Failed to save layout.');
    }
  };

  const deleteLayout = async () => {
    if (!activePlan || !window.confirm(`Are you sure you want to delete "${activePlan.name}"?`)) return;
    try {
      await api(`/floor-plans/${activePlan._id}`, { method: 'DELETE' });
      const updatedPlans = plans.filter(p => p._id !== activePlan._id);
      setPlans(updatedPlans);
      setActivePlan(updatedPlans[0] || null);
      if (selectedLayoutId === activePlan._id) setSelectedLayoutId(null);
    } catch (e) {
      alert('Failed to delete layout.');
    }
  };

  const setAsSelected = async () => {
    if (!activePlan) return;
    try {
      await api(`/events/${eventId}/selected-layout`, {
        method: 'PATCH',
        body: JSON.stringify({ layoutId: activePlan._id })
      });
      setSelectedLayoutId(activePlan._id);
      alert('This layout has been marked as the selected final layout for this event.');
    } catch (e) {
      alert('Failed to set selected layout.');
    }
  };

  const snapToGrid = (value) => Math.round(value / SNAP_GRID) * SNAP_GRID;

  const exportImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = planRef.current.clientWidth || 800;
    canvas.height = planRef.current.clientHeight || 500;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=SNAP_GRID) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke(); }
    for(let j=0; j<canvas.height; j+=SNAP_GRID) { ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke(); }

    elements.forEach((el) => {
      ctx.save();
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      ctx.translate(cx, cy);
      ctx.rotate(((el.rotation || 0) * Math.PI) / 180);
      ctx.translate(-cx, -cy);

      ctx.fillStyle = el.type === 'stage' ? '#d2b48c' : el.type === 'table' ? '#e2e8f0' : el.type === 'dancefloor' ? '#1e293b' : el.type === 'bar' ? '#0f172a' : '#cbd5e1';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      
      if (el.type === 'table') {
        ctx.beginPath();
        const radius = el.width / 2;
        ctx.arc(el.x + radius, el.y + radius, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(el.x, el.y, el.width, el.height);
        ctx.strokeRect(el.x, el.y, el.width, el.height);
      }
      
      ctx.fillStyle = el.type === 'dancefloor' || el.type === 'bar' || el.type === 'djbooth' ? '#fff' : '#1c1e26';
      ctx.font = 'bold 12px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(el.label, el.x + el.width/2, el.y + el.height/2);

      // Add Emojis to Canvas
      ctx.font = '14px serif';
      let emojis = '';
      if (el.type === 'bar') emojis = '👨‍🍳 🍸 🍷';
      if (el.type === 'buffet') emojis = '🧑‍🍳 🥘 🥗';
      if (el.type === 'djbooth') emojis = '🎧 🧑‍🎤';
      if (el.type === 'entrance') emojis = '👮‍♂️ 🚧 👮‍♀️';
      if (el.type === 'table') emojis = '🍽️ 🕯️';
      
      if (emojis) {
        const offset = el.type === 'entrance' ? -15 : 15;
        ctx.fillText(emojis, el.x + el.width/2, el.y + el.height/2 + offset);
      }
      
      ctx.restore();
    });
    
    const link = document.createElement('a');
    link.download = `layout-${activePlan?.name || 'export'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const getElementDimensions = (type) => {
    const ELEMENT_DEFAULTS = {
      table: { width: 60, height: 60, color: '#3b82f6', label: 'Round Table' },
      stage: { width: 360, height: 100, color: '#8b5cf6', label: 'Main Stage' },
      dancefloor: { width: 160, height: 120, color: '#ec4899', label: 'Dance Floor' },
    };
    const dims = {
      stage: { w: 360, h: 100 },
      table: { w: 60, h: 60 },
      entrance: { w: 100, h: 40 },
      bar: { w: 200, h: 60 },
      buffet: { w: 180, h: 60 },
      dancefloor: { w: 200, h: 200 },
      djbooth: { w: 80, h: 60 }
    };
    return dims[type] || { w: 100, h: 60 };
  };

  const addElement = (type) => {
    if (!planRef.current) return;
    const rect = planRef.current.getBoundingClientRect();
    const { w, h } = getElementDimensions(type);
    
    setElements([...elements, {
      id: Date.now().toString(),
      type,
      x: snapToGrid((rect.width / 2) - (w / 2)),
      y: snapToGrid((rect.height / 2) - (h / 2)),
      width: w,
      height: h,
      rotation: 0,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('floor', ' Floor').replace('booth', ' Booth'),
    }]);
  };

  const onDragStartToolbox = (e, type) => {
    e.dataTransfer.setData('type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const onDragOverCanvas = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDropCanvas = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('type');
    if (!type || !planRef.current) return;
    
    const rect = planRef.current.getBoundingClientRect();
    const rawX = e.clientX - rect.left;
    const rawY = e.clientY - rect.top;
    
    const { w, h } = getElementDimensions(type);
    
    setElements([...elements, {
      id: Date.now().toString(),
      type,
      x: snapToGrid(rawX - w/2),
      y: snapToGrid(rawY - h/2),
      width: w,
      height: h,
      rotation: 0,
      label: type.charAt(0).toUpperCase() + type.slice(1).replace('floor', ' Floor').replace('booth', ' Booth'),
    }]);
  };

  const onMouseDownElement = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = elements.find(el => el.id === id);
    setDragging({ id, startX: e.clientX, startY: e.clientY, initElX: el.x, initElY: el.y });
  };

  const onMouseMove = (e) => {
    if (!dragging || !planRef.current) return;
    const rect = planRef.current.getBoundingClientRect();
    
    setElements((els) => els.map((el) => {
      if (el.id !== dragging.id) return el;
      const newX = snapToGrid(dragging.initElX + (e.clientX - dragging.startX));
      const newY = snapToGrid(dragging.initElY + (e.clientY - dragging.startY));
      // Relaxed bounds: allow center of element to reach the edges, preventing rotation clipping
      return { 
        ...el, 
        x: Math.max(-el.width/2, Math.min(rect.width - el.width/2, newX)), 
        y: Math.max(-el.height/2, Math.min(rect.height - el.height/2, newY)) 
      };
    }));
  };

  const onMouseUp = () => setDragging(null);

  const removeElement = (id) => setElements(elements.filter(el => el.id !== id));

  const rotateElement = (id, e) => {
    e.stopPropagation();
    setElements(els => els.map(el => {
      if (el.id !== id) return el;
      return { ...el, rotation: ((el.rotation || 0) + 90) % 360 };
    }));
  };

  const autoLayout = () => {
    if (!planRef.current) return;
    const rect = planRef.current.getBoundingClientRect();
    let grouped = { stage: [], entrance: [], table: [], bar: [], buffet: [], dancefloor: [], djbooth: [] };
    elements.forEach(el => { if (grouped[el.type]) grouped[el.type].push({...el}); });

    const PADDING = 20;

    // Calculate available height for side walls to avoid overlapping entrances
    const hasEntrances = grouped.entrance.length > 0;
    const availableSideHeight = rect.height - (PADDING * 2) - (hasEntrances ? 200 : 0);

    // ZONE 1: Perimeter (Walls)
    // Left Wall (Bars)
    const leftWallCount = grouped.bar.length;
    if (leftWallCount > 0) {
      const spacing = availableSideHeight / leftWallCount;
      grouped.bar.forEach((b, i) => {
        b.rotation = 270; // Face towards the center (Right)
        // Compensate for rotation around center so it visually touches the left wall
        b.x = snapToGrid(PADDING - Math.abs(b.width - b.height)/2); 
        b.y = snapToGrid(PADDING + (i * spacing) + (spacing / 2) - (b.height / 2));
      });
    }

    // Right Wall (Buffets)
    const rightWallCount = grouped.buffet.length;
    if (rightWallCount > 0) {
      const spacing = availableSideHeight / rightWallCount;
      grouped.buffet.forEach((bf, i) => {
        bf.rotation = 90; // Face towards the center (Left)
        // Compensate for rotation around center so it visually touches the right wall
        bf.x = snapToGrid(rect.width - PADDING - Math.max(bf.width, bf.height) + Math.abs(bf.width - bf.height)/2);
        bf.y = snapToGrid(PADDING + (i * spacing) + (spacing / 2) - (bf.height / 2));
      });
    }

    // Bottom Wall (Entrances)
    const centerX = rect.width / 2;
    grouped.entrance.forEach((e, i) => {
      e.rotation = 0;
      e.y = snapToGrid(rect.height - e.height - PADDING);
      
      if (grouped.entrance.length === 1) {
        e.x = snapToGrid(centerX - e.width / 2);
      } else {
        // Spread symmetrically around center
        const spreadOffset = 150;
        e.x = snapToGrid(centerX + (i % 2 === 0 ? -spreadOffset - e.width/2 : spreadOffset - e.width/2));
      }
    });

    // ZONE 2: Focal (Top Center)
    let currentY = PADDING * 2;
    
    // ZONE 2: Center Back (Stage)
    if (grouped.stage.length > 0) {
      const stageW = 360;
      const stageH = 100;
      
      const maxCols = Math.max(1, Math.floor((rect.width - PADDING*2) / stageW));
      const cols = Math.min(grouped.stage.length, maxCols);
      const totalStageW = cols * stageW;
      const startX = snapToGrid((rect.width / 2) - (totalStageW / 2));
      
      grouped.stage.forEach((s, i) => {
        s.width = stageW;
        s.height = stageH;
        s.rotation = 0;
        const row = Math.floor(i / cols);
        const col = i % cols;
        s.x = startX + col * stageW; // tile seamlessly without gaps
        s.y = snapToGrid(PADDING + row * stageH);
      });
      const rows = Math.ceil(grouped.stage.length / cols);
      currentY += (rows * stageH) + PADDING;
    }

    // DJ Booth (Place next to the right-most stage)
    grouped.djbooth.forEach((dj, i) => {
      dj.rotation = 0;
      if (grouped.stage.length > 0) {
        const lastStage = grouped.stage[grouped.stage.length - 1];
        dj.x = snapToGrid(lastStage.x + lastStage.width + PADDING);
        dj.y = snapToGrid(lastStage.y);
      } else {
        dj.x = snapToGrid((rect.width / 2) - (dj.width / 2) + (i * (dj.width + PADDING)));
        dj.y = snapToGrid(currentY);
        if (i === grouped.djbooth.length - 1) currentY += dj.height + PADDING;
      }
    });

    // Dance Floors (Layout horizontally and snap together to form a bigger floor)
    if (grouped.dancefloor.length > 0) {
      const dfW = 200;
      const dfH = 200;
      // Wrap into multiple rows if it gets too wide
      const maxCols = Math.max(1, Math.floor((rect.width - 240) / dfW));
      const cols = Math.min(grouped.dancefloor.length, maxCols);
      const totalDfW = cols * dfW;
      const startX = (rect.width / 2) - (totalDfW / 2);
      
      grouped.dancefloor.forEach((df, i) => {
        df.rotation = 0;
        const row = Math.floor(i / cols);
        const col = i % cols;
        df.x = snapToGrid(startX + col * dfW); // No padding so they tile seamlessly!
        df.y = snapToGrid(currentY + row * dfH);
      });
      const rows = Math.ceil(grouped.dancefloor.length / cols);
      currentY += (rows * dfH) + PADDING;
    }

    // ZONE 3: Fill (Tables)
    // Calculate safe bounding box avoiding Perimeter and Focal
    const sideWallSpace = 100; // Space needed for rotated elements
    const safeMinX = PADDING + (leftWallCount > 0 ? sideWallSpace : 0);
    const safeMaxX = rect.width - PADDING - (rightWallCount > 0 ? sideWallSpace : 0);
    const safeWidth = safeMaxX - safeMinX;

    if (grouped.table.length > 0) {
      const tableW = 60;
      const tableH = 60;
      
      let cols = Math.floor(safeWidth / (tableW + PADDING));
      if (cols < 1) cols = 1;
      
      const totalRowWidth = (cols * tableW) + ((cols - 1) * PADDING);
      const startX = safeMinX + (safeWidth - totalRowWidth) / 2;
      const startY = currentY + PADDING;

      grouped.table.forEach((t, i) => {
        t.rotation = 0;
        const row = Math.floor(i / cols);
        const col = i % cols;
        t.x = snapToGrid(startX + col * (tableW + PADDING));
        t.y = snapToGrid(startY + row * (tableH + PADDING));
      });
    }

    setElements(Object.values(grouped).flat());
  };

  const getElementDecorations = (type) => {
    switch (type) {
      case 'bar': return <div style={{ position: 'absolute', bottom: '5px', left: 0, width: '100%', textAlign: 'center', fontSize: '1rem', opacity: 0.8 }}>👨‍🍳 🍸 🍷</div>;
      case 'buffet': return <div style={{ position: 'absolute', bottom: '5px', left: 0, width: '100%', textAlign: 'center', fontSize: '1rem', opacity: 0.8 }}>🧑‍🍳 🥘 🥗</div>;
      case 'djbooth': return <div style={{ position: 'absolute', bottom: '2px', left: 0, width: '100%', textAlign: 'center', fontSize: '1.2rem', opacity: 0.8 }}>🎧 🧑‍🎤</div>;
      case 'entrance': return <div style={{ position: 'absolute', top: '-15px', left: 0, width: '100%', textAlign: 'center', fontSize: '1.2rem', opacity: 0.8 }}>👮‍♂️ 🚧 👮‍♀️</div>;
      case 'table': return <div style={{ position: 'absolute', bottom: '15px', left: 0, width: '100%', textAlign: 'center', fontSize: '1rem', opacity: 0.8 }}>🍽️ 🕯️</div>;
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem' }}>Venue Layout Designer</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Click an item to add it, or drag and drop. Hover to rotate. Double-click to delete.</p>
        </div>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '250px' }}>
          <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
            {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
        </div>
      </div>

      <div className="designer-layout" style={{ flex: 1, minHeight: '600px' }}>
        {/* Design Toolbox */}
        <div className="designer-sidebar card" style={{ overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Toolbox</h3>
          <div className="toolbox-items">
            <div className="toolbox-item toolbox-stage" onClick={() => addElement('stage')} draggable onDragStart={(e) => onDragStartToolbox(e, 'stage')}><span className="icon">🎤</span> Stage</div>
            <div className="toolbox-item toolbox-table" onClick={() => addElement('table')} draggable onDragStart={(e) => onDragStartToolbox(e, 'table')}><span className="icon">🍽️</span> Round Table</div>
            <div className="toolbox-item toolbox-entrance" onClick={() => addElement('entrance')} draggable onDragStart={(e) => onDragStartToolbox(e, 'entrance')}><span className="icon">🚪</span> Entrance</div>
            <div className="toolbox-item toolbox-bar" onClick={() => addElement('bar')} draggable onDragStart={(e) => onDragStartToolbox(e, 'bar')}><span className="icon">🍸</span> Bar</div>
            <div className="toolbox-item toolbox-buffet" onClick={() => addElement('buffet')} draggable onDragStart={(e) => onDragStartToolbox(e, 'buffet')}><span className="icon">🍲</span> Buffet Station</div>
            <div className="toolbox-item toolbox-dancefloor" onClick={() => addElement('dancefloor')} draggable onDragStart={(e) => onDragStartToolbox(e, 'dancefloor')}><span className="icon">💃</span> Dance Floor</div>
            <div className="toolbox-item toolbox-djbooth" onClick={() => addElement('djbooth')} draggable onDragStart={(e) => onDragStartToolbox(e, 'djbooth')}><span className="icon">🎧</span> DJ Booth</div>
          </div>
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={autoLayout} style={{ width: '100%' }}>✨ Auto-Layout</button>
            <button type="button" className="btn" onClick={() => setShow3D(true)} style={{ width: '100%', backgroundColor: '#6366f1', color: 'white', borderColor: '#6366f1' }}>🎮 View in 3D</button>
            <button type="button" className="btn" onClick={save} style={{ width: '100%' }}>Save Plan</button>
            <button type="button" className="btn btn-secondary" onClick={exportImage} style={{ width: '100%' }}>Export PNG</button>
            {activePlan && (
              <>
                <button 
                  type="button" 
                  className={`btn ${selectedLayoutId === activePlan._id ? 'btn-success' : 'btn-secondary'}`} 
                  onClick={setAsSelected} 
                  style={{ width: '100%' }}
                >
                  {selectedLayoutId === activePlan._id ? '★ Selected Plan' : 'Set as Selected Plan'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={deleteLayout} style={{ width: '100%', borderColor: '#ef4444', color: '#ef4444' }}>Delete Layout</button>
              </>
            )}
          </div>
        </div>

        {/* Canvas Area with Tabs */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="designer-canvas card" style={{ flex: 1, marginBottom: '1rem' }} ref={planRef} onDragOver={onDragOverCanvas} onDrop={onDropCanvas} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
            {elements.map((el) => (
              <div
                key={el.id}
                className={`floor-element type-${el.type} ${dragging?.id === el.id ? 'dragging' : ''}`}
                style={{ left: el.x, top: el.y, width: el.width, height: el.height, transform: `rotate(${el.rotation || 0}deg)` }}
                onMouseDown={(e) => onMouseDownElement(el.id, e)}
                onDoubleClick={() => removeElement(el.id)}
              >
                <div className="element-label">{el.label}</div>
                {getElementDecorations(el.type)}
                <div className="rotate-handle" onMouseDown={(e) => rotateElement(el.id, e)}>↻</div>
              </div>
            ))}
          </div>
          
          {/* Layout Tabs */}
          <div className="layout-tabs">
            {plans.map(p => (
              <button 
                key={p._id} 
                className={`tab-btn ${activePlan?._id === p._id ? 'active' : ''}`} 
                onClick={() => setActivePlan(p)}
              >
                {selectedLayoutId === p._id ? '★ ' : ''}{p.name}
              </button>
            ))}
            {plans.length < 5 && (
              <button className="tab-btn new-tab" onClick={createNewPlan}>+ New Layout</button>
            )}
          </div>
        </div>
      </div>
      {show3D && <FloorPlan3D elements={elements} onClose={() => setShow3D(false)} />}
    </div>
  );
}

export function FloorPlanViewer() {
  const [events, setEvents] = useState([]);
  const [elements, setElements] = useState([]);

  useEffect(() => {
    api('/events').then(async (evts) => {
      setEvents(evts);
      if (evts.length) {
        const plans = await api(`/floor-plans/event/${evts[0]._id}`);
        if (plans.length > 0) setElements(plans[0].elements || []);
      }
    });
  }, []);

  return (
    <div>
      <h1 className="page-title">Floor Plan</h1>
      <div className="designer-canvas card" style={{ height: '500px', cursor: 'default' }}>
        {elements.map((el) => (
          <div key={el.id} className={`floor-element type-${el.type}`} style={{ left: el.x, top: el.y, width: el.width, height: el.height, transform: `rotate(${el.rotation || 0}deg)`, cursor: 'default' }}>
            <div className="element-label">{el.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
