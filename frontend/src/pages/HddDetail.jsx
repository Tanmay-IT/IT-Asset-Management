import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  FileSearch,
  Search,
  StickyNote,
  Maximize2,
  Minimize2,
  Pencil,
  Settings2,
} from 'lucide-react';
import { Tag } from '../components/Tag';
import { CopyButton } from '../components/CopyButton';
import { HddDriveSection } from '../components/HddDriveSection';
import { HddDriveEditor } from '../components/HddDriveEditor';
import { HddFormModal } from '../components/HddFormModal';
import { useHddRecord } from '../hooks/useHddRecord';
import { useHddMutations } from '../hooks/useHddMutations';
import { getHddStatus } from '../lib/hddStatus';
import { deriveDataCategories } from '../lib/hddDataCategories';

const DRIVE_LETTERS = ['C', 'D', 'E'];

const INFO_FIELDS = [
  { key: 'allotted', detailKey: 'userName', label: 'Assigned To' },
  { key: 'brand', detailKey: 'brand', label: 'Brand' },
  { key: 'type', detailKey: 'type', label: 'Type' },
  { key: 'capacity', detailKey: 'capacity', label: 'Capacity' },
  { key: 'date', detailKey: 'dateAlloted', label: 'Date Allotted' },
  { key: 'information', detailKey: null, label: 'Information' },
];

function findFirstEmail(detail) {
  if (!detail?.drives) return null;
  const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
  for (const drive of detail.drives) {
    for (const entry of drive.entries || []) {
      const text = [entry.nameDescription, entry.formatExtension, entry.notes].filter(Boolean).join(' ');
      const match = text.match(emailPattern);
      if (match) return match[0];
    }
  }
  return null;
}

function cloneDrives(drives) {
  return (drives || []).map((drive) => ({ ...drive, entries: (drive.entries || []).map((entry) => ({ ...entry })) }));
}

function DiscrepancyRow({ label, mainValue, detailValue }) {
  return (
    <div>
      <p className="text-sm text-amber-800 dark:text-amber-400">{label}</p>
      <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-white px-3 py-2 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Main</p>
          <p className="break-all font-mono text-sm text-gray-900 dark:text-gray-100">{mainValue}</p>
        </div>
        <div className="rounded-md bg-white px-3 py-2 dark:bg-gray-900">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Detail</p>
          <p className="break-all font-mono text-sm text-gray-900 dark:text-gray-100">{detailValue}</p>
        </div>
      </div>
    </div>
  );
}

export function HddDetail() {
  const { kind, id } = useParams();
  const { data, isLoading, error, refetch } = useHddRecord(kind, id);
  const { updateMain, updateDetail, createDetail } = useHddMutations();
  const navigate = useNavigate();

  const [showOriginal, setShowOriginal] = useState(false);
  const [closedDrives, setClosedDrives] = useState(() => new Set());
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingDrives, setIsEditingDrives] = useState(false);
  const [draftDrives, setDraftDrives] = useState([]);
  const [isSavingDrives, setIsSavingDrives] = useState(false);
  const [drivesError, setDrivesError] = useState(null);

  useEffect(() => {
    setShowOriginal(false);
    setClosedDrives(new Set());
    setIsEditingInfo(false);
    setIsEditingDrives(false);
    setDrivesError(null);
  }, [kind, id]);

  const dataCategories = useMemo(() => deriveDataCategories(data?.detail), [data?.detail]);
  const email = useMemo(() => findFirstEmail(data?.detail), [data?.detail]);

  if (isLoading) return <p className="text-sm text-gray-500">Loading HDD record...</p>;
  if (error) return <p className="text-sm text-red-600">Could not load this HDD record: {error.message}</p>;
  if (!data) return null;

  const { main, detail } = data;
  const status = getHddStatus({ detail });
  const title = main?.allotted || detail?.userName || 'Unnamed HDD';
  const serial = main?.serialNumber || detail?.serialNumber;
  const allFlags = [...(main?.verificationFlags || []), ...(detail?.verificationFlags || [])];
  const note = main?.note;
  const hasStorageContents = Boolean(detail && detail.hasData !== false && detail.drives?.length);

  const serialDiffers = main && detail && main.serialNumber.trim() !== (detail.serialNumber || '').trim();
  const nameDiffers =
    main && detail && main.allotted.trim().toLowerCase() !== (detail.userName || '').trim().toLowerCase();

  function expandAllDrives() {
    setClosedDrives(new Set());
  }
  function collapseAllDrives() {
    setClosedDrives(new Set((detail?.drives || []).map((d) => d.driveLetter)));
  }
  function toggleDrive(letter) {
    setClosedDrives((prev) => {
      const next = new Set(prev);
      if (next.has(letter)) next.delete(letter);
      else next.add(letter);
      return next;
    });
  }

  async function handleEditInfoSubmit({ main: mainForm, detail: detailForm }) {
    if (mainForm && main) {
      await updateMain(main._id, mainForm);
    }
    if (detailForm) {
      if (detail) await updateDetail(detail._id, detailForm);
      else if (main) await createDetail(main._id, detailForm);
    }
    await refetch();
  }

  function startEditingDrives() {
    setDraftDrives(cloneDrives(detail?.drives));
    setDrivesError(null);
    setIsEditingDrives(true);
  }
  function cancelEditingDrives() {
    setIsEditingDrives(false);
    setDrivesError(null);
  }
  async function saveDrives() {
    setIsSavingDrives(true);
    setDrivesError(null);
    try {
      await updateDetail(detail._id, { drives: draftDrives });
      await refetch();
      setIsEditingDrives(false);
    } catch (err) {
      setDrivesError(err);
    } finally {
      setIsSavingDrives(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to="/hdd" className="no-print flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft size={16} /> Back to HDD Inventory
      </Link>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-lg font-semibold text-gray-900 sm:text-xl dark:text-gray-100">{title}</h1>
          <Tag color={status.color}>{status.label}</Tag>
        </div>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
          {(main?.brand || detail?.brand) && <span>{main?.brand || detail?.brand}</span>}
          {(main?.capacity || detail?.capacity) && <span>· {main?.capacity || detail?.capacity}</span>}
          {serial ? (
            <span className="flex items-center gap-1.5">
              · <span className="break-all font-mono">{serial}</span>
            </span>
          ) : (
            <span className="text-gray-400">· Serial number not available in source data</span>
          )}
        </div>

        <div className="no-print flex flex-wrap gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
          <button
            onClick={() => setIsEditingInfo(true)}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
          >
            <Pencil size={13} /> Edit HDD
          </button>
          <CopyButton value={serial} label="Copy Serial Number" copiedLabel="Serial number copied" size="md" />
          {email && <CopyButton value={email} label="Copy Email" copiedLabel="Email copied" size="md" />}
          <button
            onClick={() => navigate('/hdd', { state: { initialQuery: serial || title } })}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <Search size={13} /> Search this HDD
          </button>
          <button
            onClick={() => setShowOriginal((prev) => !prev)}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <FileSearch size={13} /> {showOriginal ? 'Hide' : 'View'} Source Record
          </button>
          {hasStorageContents && !isEditingDrives && (
            <>
              <button
                onClick={expandAllDrives}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Maximize2 size={13} /> Expand All
              </button>
              <button
                onClick={collapseAllDrives}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Minimize2 size={13} /> Collapse All
              </button>
            </>
          )}
        </div>
      </div>

      {note?.trim() && (
        <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <StickyNote size={14} /> Current Note
          </p>
          <p className="text-sm text-gray-900 dark:text-gray-100">{note}</p>
        </div>
      )}

      {detail?.matchConfidence === 'discrepancy' && main && (
        <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <p className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-400">
            <AlertTriangle size={16} /> Verification Required
          </p>
          {serialDiffers && (
            <DiscrepancyRow
              label="Serial number differs between Main inventory and the detailed record."
              mainValue={main.serialNumber || 'Not available'}
              detailValue={detail.serialNumber || 'Not available'}
            />
          )}
          {nameDiffers && (
            <DiscrepancyRow
              label="Name differs between Main inventory and the detailed record."
              mainValue={main.allotted || 'Not available'}
              detailValue={detail.userName || 'Not available'}
            />
          )}
        </div>
      )}

      {!main && detail && detail.serialNumber && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
          <AlertTriangle size={16} />
          No matching Main inventory record was found for this detail sheet's serial number.
        </div>
      )}

      {allFlags.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">All verification notes</p>
          <ul className="list-inside list-disc text-sm text-gray-600 dark:text-gray-300">
            {allFlags.map((flag, index) => (
              <li key={index}>{flag}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">HDD Information</h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INFO_FIELDS.map(({ key, detailKey, label }) => {
            const value = main?.[key] || (detailKey ? detail?.[detailKey] : '');
            return (
              <div key={label}>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
                <dd className="text-sm text-gray-900 dark:text-gray-100">{value || '—'}</dd>
              </div>
            );
          })}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Serial Number</dt>
            <dd className="break-all font-mono text-sm text-gray-900 dark:text-gray-100">
              {serial || <span className="font-sans text-gray-400">Not available in source data</span>}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Data Overview</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {DRIVE_LETTERS.map((letter) => {
            const drive = detail?.drives?.find((d) => d.driveLetter === letter);
            const count = drive?.entries?.length || 0;
            return (
              <div key={letter} className="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{letter}:\</p>
                <p className="text-xs text-gray-400">
                  {drive?.driveType || (letter === 'C' ? 'System Drive' : 'Data Drive')}
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {!detail || detail.hasData === false
                    ? 'No detailed data recorded'
                    : count > 0
                      ? `${count} entr${count === 1 ? 'y' : 'ies'} recorded`
                      : 'No detailed data recorded'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {detail && detail.hasData !== false && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">Data Found</h2>
          {dataCategories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dataCategories.map((category) => (
                <Tag key={category} color="gray">
                  {category}
                </Tag>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No specific data categories were detected in the recorded entries.</p>
          )}
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Storage Contents</h2>
          {detail && detail.hasData !== false && !isEditingDrives && (
            <button
              onClick={startEditingDrives}
              type="button"
              className="no-print inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Settings2 size={13} /> Edit Contents
            </button>
          )}
        </div>

        {!detail && (
          <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No detailed drive information is recorded for this HDD. Use "Edit HDD" above to record a detail sheet
            for it.
          </p>
        )}
        {detail && detail.hasData === false && (
          <p className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            No populated data recorded in this source sheet.
          </p>
        )}

        {isEditingDrives ? (
          <div className="flex flex-col gap-3">
            <HddDriveEditor drives={draftDrives} onChange={setDraftDrives} />
            {drivesError && (
              <p className="text-sm text-red-600">
                {drivesError.response?.data?.message || 'Could not save drive contents. Please try again.'}
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={saveDrives}
                disabled={isSavingDrives}
                type="button"
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {isSavingDrives ? 'Saving...' : 'Save Contents'}
              </button>
              <button
                onClick={cancelEditingDrives}
                type="button"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          hasStorageContents && (
            <div className="flex flex-col gap-3">
              {detail.drives.map((drive) => (
                <HddDriveSection
                  key={drive.driveLetter}
                  drive={drive}
                  isOpen={!closedDrives.has(drive.driveLetter)}
                  onToggle={() => toggleDrive(drive.driveLetter)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {showOriginal && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100">Source Record</h2>
          <div className="mb-3 flex flex-col gap-0.5 text-xs text-gray-400">
            {main && (
              <p>
                {main.isHistorical
                  ? `Main record — from ${main.sourceWorkbook || 'HDD_data_final.xlsx'}, Main Record ${main.srNo ?? '(unnumbered row)'}`
                  : 'Main record — added or edited directly in the application (not part of the original imported workbook).'}
              </p>
            )}
            {detail && (
              <p>
                {detail.isHistorical
                  ? `Detail sheet — from ${detail.sourceWorkbook || 'HDD_data_final.xlsx'}, Sheet ${detail.sourceSheet}`
                  : 'Detail sheet — added or edited directly in the application (not part of the original imported workbook).'}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-4 text-sm">
            {main && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Main Record — Current Stored Values
                </p>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <OriginalField label="HDD Allotted" value={main.allotted} />
                  <OriginalField label="Brand" value={main.brand} />
                  <OriginalField label="Type" value={main.type} />
                  <OriginalField label="Capacity" value={main.capacity} />
                  <OriginalField label="Serial Number" value={main.serialNumber} mono />
                  <OriginalField label="Date" value={main.date} />
                  <OriginalField label="Information" value={main.information} />
                  <OriginalField label="Note" value={main.note} />
                </dl>
              </div>
            )}
            {detail && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Detail Sheet {detail.sourceSheet} — Current Stored Values
                </p>
                <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <OriginalField label="User Name" value={detail.userName} />
                  <OriginalField label="Brand" value={detail.brand} />
                  <OriginalField label="Type" value={detail.type} />
                  <OriginalField label="Capacity" value={detail.capacity} />
                  <OriginalField label="Serial Number" value={detail.serialNumber} mono />
                  <OriginalField label="Date Allotted" value={detail.dateAlloted} />
                </dl>
              </div>
            )}
          </div>
        </div>
      )}

      {isEditingInfo && (
        <HddFormModal
          mode="edit"
          main={main}
          detail={detail}
          onClose={() => setIsEditingInfo(false)}
          onSubmit={handleEditInfoSubmit}
        />
      )}
    </div>
  );
}

function OriginalField({ label, value, mono }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className={`whitespace-pre-wrap break-words text-sm text-gray-900 dark:text-gray-100 ${mono ? 'break-all font-mono' : ''}`}>
        {value ? `"${value}"` : <span className="text-gray-400">Not available</span>}
      </dd>
    </div>
  );
}
