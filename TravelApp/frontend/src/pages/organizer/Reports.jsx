import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrganizerReports() {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState('');
  const [report, setReport] = useState(null);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    api('/events').then((evts) => {
      setEvents(evts);
      if (evts.length) setEventId(evts[0]._id);
    });
    api('/feedback').then(setFeedback).catch(console.error);
  }, []);

  useEffect(() => {
    if (eventId) api(`/events/${eventId}/report`).then(setReport).catch(console.error);
  }, [eventId]);

  const exportReport = () => {
    if (!report) return;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22);
    doc.text(`Event Report: ${report.event.name}`, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    
    let currentHeaderY = 30;
    doc.text(`Date: ${report.event.date || 'TBD'}`, 14, currentHeaderY);
    currentHeaderY += 6;
    doc.text(`Status: ${report.event.status?.toUpperCase()}`, 14, currentHeaderY);
    currentHeaderY += 6;
    if (report.event.dressCode) {
      doc.text(`Dress Code: ${report.event.dressCode}`, 14, currentHeaderY);
      currentHeaderY += 6;
    }
    if (report.event.agenda) {
      doc.text(`Agenda: ${report.event.agenda}`, 14, currentHeaderY);
      currentHeaderY += 6;
    }

    // Attendance Summary
    doc.setTextColor(0);
    doc.setFontSize(16);
    doc.text('Attendance Summary', 14, currentHeaderY + 8);
    autoTable(doc, {
      startY: currentHeaderY + 12,
      head: [['Invited', 'RSVP Attending', 'Arrived / Checked-in']],
      body: [[
        report.attendance.invited,
        report.attendance.attending,
        report.attendance.arrived
      ]],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    // Budget Summary
    if (report.budget) {
      doc.setFontSize(16);
      doc.text('Financials & Budget', 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Planned Budget', 'Actual Spent', 'Remaining Balance']],
        body: [[
          `EGP ${report.budget.planned?.toLocaleString() || 0}`,
          `EGP ${report.budget.actual?.toLocaleString() || 0}`,
          `EGP ${report.budget.difference?.toLocaleString() || 0}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] }
      });

      currentY = doc.lastAutoTable.finalY + 15;
      
      // Itemized Expenses
      if (report.budget.expenses?.length > 0) {
        doc.setFontSize(14);
        doc.text('Itemized Expenses', 14, currentY);
        autoTable(doc, {
          startY: currentY + 5,
          head: [['Category', 'Description', 'Amount', 'Date']],
          body: report.budget.expenses.map(e => [
            e.category,
            e.description,
            `EGP ${e.amount.toLocaleString()}`,
            new Date(e.date).toLocaleDateString()
          ]),
          theme: 'striped',
          headStyles: { fillColor: [51, 65, 85] }
        });
        currentY = doc.lastAutoTable.finalY + 15;
      }
    }

    // Feedback
    doc.setFontSize(16);
    doc.text(`Guest Feedback (Average: ${report.feedback.averageRating?.toFixed(1) || 0}/5)`, 14, currentY);
    
    if (report.feedback.items?.length > 0) {
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Guest Name', 'Rating', 'Comments']],
        body: report.feedback.items.map(f => [
          f.guestName || 'Anonymous',
          `${f.overallRating}/5`,
          f.comments || 'No comments'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { cellWidth: 'wrap' },
        columnStyles: { 2: { cellWidth: 'auto' } }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('No feedback collected yet.', 14, currentY + 10);
      currentY += 20;
    }

    // Proposals / Vendors
    if (report.proposals && report.proposals.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Approved Vendor Proposals', 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Service/Role', 'Delivery Status', 'Notes']],
        body: report.proposals.map(p => [
          p.roleRequested || p.service || 'Vendor',
          p.deliveryStatus?.toUpperCase() || 'PENDING',
          p.delayNote || p.vendorMessage || 'No notes'
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Tasks Checklist
    if (report.tasks && report.tasks.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text('Event Task Checklist', 14, currentY);
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Task', 'Status', 'Due Date']],
        body: report.tasks.map(t => [
          t.title,
          t.status?.toUpperCase() || 'TODO',
          new Date(t.dueDate).toLocaleDateString()
        ]),
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] }
      });
      currentY = doc.lastAutoTable.finalY + 15;
    }

    // Visual Floor Plan Layout
    if (report.selectedLayout && report.selectedLayout.elements) {
      doc.addPage();
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(`Final Selected Layout: ${report.selectedLayout.name}`, 14, 20);
      
      const elements = report.selectedLayout.elements;
      const SNAP_GRID = 20;
      
      let maxX = 800;
      let maxY = 500;
      elements.forEach(el => {
        if (el.x + el.width > maxX) maxX = el.x + el.width + 100;
        if (el.y + el.height > maxY) maxY = el.y + el.height + 100;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = maxX;
      canvas.height = maxY;
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
        ctx.restore();
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 182;
      const aspectRatio = canvas.height / canvas.width;
      let imgHeight = pdfWidth * aspectRatio;
      let imgWidth = pdfWidth;

      const maxPdfHeight = 250;
      if (imgHeight > maxPdfHeight) {
        imgHeight = maxPdfHeight;
        imgWidth = imgHeight / aspectRatio;
      }
      const xOffset = 14 + (pdfWidth - imgWidth) / 2;
      
      doc.addImage(imgData, 'PNG', xOffset, 30, imgWidth, imgHeight);
    }

    doc.save(`Event_Report_${report.event.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div>
      <h1 className="page-title">Reports & Feedback</h1>

      <div className="form-group">
        <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
        </select>
        <button type="button" className="btn" onClick={exportReport} style={{ marginLeft: '0.5rem' }}>Export Report</button>
      </div>

      {report && (
        <>
          <div className="grid grid-3 card">
            <div className="stat"><div className="stat-value">{report.attendance.invited}</div><div className="stat-label">Invited</div></div>
            <div className="stat"><div className="stat-value">{report.attendance.attending}</div><div className="stat-label">Attending</div></div>
            <div className="stat"><div className="stat-value">{report.attendance.arrived}</div><div className="stat-label">Arrived</div></div>
          </div>

          {report.budget && (
            <div className="card">
              <h3>Budget Summary</h3>
              <p>Planned: EGP {report.budget.planned?.toLocaleString()} · Actual: EGP {report.budget.actual?.toLocaleString()} · Difference: EGP {report.budget.difference?.toLocaleString()}</p>
            </div>
          )}

          <div className="card">
            <h3>Feedback (Avg: {report.feedback.averageRating?.toFixed(1)}/5)</h3>
            {report.feedback.items?.map((f) => (
              <div key={f._id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <strong>{f.guestName}</strong> — {f.overallRating}/5
                <p>{f.comments}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="card">
        <h3>All Feedback</h3>
        {feedback.map((f) => (
          <div key={f._id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
            <strong>{f.guestName}</strong> — {f.overallRating}/5
            <p>{f.comments}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
