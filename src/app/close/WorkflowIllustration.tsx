import React from 'react';

export type StageKey = 'warehouse' | 'cost' | 'receivables' | 'accounting' | 'report';

function Platform({ accent }: { accent: string }) {
  return <>
    <ellipse cx="101" cy="153" rx="76" ry="13" fill="#35576a" opacity=".13" />
    <path d="M16 121 99 80 184 122 101 165Z" fill="#eaf3f1" />
    <path d="M16 121 101 165 101 171 16 128Z" fill="#bfd4d4" />
    <path d="M101 165 184 122 184 129 101 171Z" fill="#91b3ba" />
    <path d="M29 127 101 163 174 127" fill="none" stroke={accent} strokeWidth="2.2" opacity=".8" />
  </>;
}

function Warehouse() {
  return <>
    <path d="M42 76 96 48 157 78 102 108Z" fill="#f9fcfa" stroke="#98b7bd" strokeWidth="1.5" />
    <path d="M42 76 102 108 102 140 42 108Z" fill="#dbeae9" />
    <path d="M102 108 157 78 157 110 102 140Z" fill="#a8c9ca" />
    <path d="M55 69 112 98M70 62 127 91M85 54 143 84" stroke="#c4d9d8" strokeWidth="2" />
    <path d="M54 87 80 100 80 125 54 112Z" fill="#edf6f2" stroke="#93b5b7" strokeWidth="1.5" />
    <path d="M57 96 77 106M57 103 77 113M57 110 77 120" stroke="#b3cbd0" strokeWidth="1.5" />
    <path d="M86 105 97 111 97 132 86 126Z" fill="#274c68" />
    <path d="M112 112 142 95 142 113 112 130Z" fill="#e9f2ed" />
    <path d="M116 115 137 103M116 121 137 109" stroke="#9cbcc1" strokeWidth="2" />
    <path d="M42 108 102 140 98 145 39 113Z" fill="#849ea7" />
    <path d="M121 133 134 126 147 133 134 140Z" fill="#f6d5a0" />
    <path d="M121 133 134 140 134 151 121 144Z" fill="#d5a86a" />
    <path d="M134 140 147 133 147 144 134 151Z" fill="#bb8e57" />
    <path d="M135 130 143 126 151 130 143 135Z" fill="#fff0cf" />
    <path d="M135 130 143 135 143 143 135 138Z" fill="#d9af75" />
    <path d="M143 135 151 130 151 138 143 143Z" fill="#b88c56" />
    <path d="M50 120 62 126 72 121 60 115Z" fill="#f8e2ba" />
    <path d="M50 120 62 126 62 136 50 130Z" fill="#d8ad74" />
    <path d="M62 126 72 121 72 131 62 136Z" fill="#b98b59" />
    <path d="M58 124 62 126 66 124" fill="none" stroke="#fff5de" strokeWidth="1.5" />
  </>;
}

function Factory() {
  return <>
    <path d="M38 92 91 65 154 95 101 124Z" fill="#f9fcfa" />
    <path d="M38 92 101 124 101 145 38 113Z" fill="#d9e8e9" />
    <path d="M101 124 154 95 154 116 101 145Z" fill="#9cbdc4" />
    <path d="M53 88 91 69 138 93 100 112Z" fill="#d2e3e3" stroke="#86aab4" strokeWidth="1.5" />
    <path d="M58 87 75 79 92 87 76 96ZM86 101 103 92 121 101 104 110Z" fill="#ecf5f3" stroke="#a0c0c1" />
    <path d="M105 113 139 95 139 117 105 135Z" fill="#e9f2ec" />
    <path d="M111 115 120 110 120 124 111 129ZM126 107 135 102 135 117 126 121Z" fill="#4c8faa" />
    <path d="M62 95 78 103 78 121 62 113Z" fill="#eff6f4" />
    <path d="M82 105 96 112 96 131 82 123Z" fill="#eff6f4" />
    <path d="M63 64 74 59 84 64 73 70Z" fill="#f7faf5" stroke="#91b4bb" strokeWidth="1" />
    <path d="M63 64 73 70 73 92 63 86ZM73 70 84 64 84 86 73 92Z" fill="#8db5c3" />
    <path d="M104 51 116 45 128 51 116 57Z" fill="#f7faf5" stroke="#91b4bb" strokeWidth="1" />
    <path d="M104 51 116 57 116 89 104 83ZM116 57 128 51 128 83 116 89Z" fill="#77a8bb" />
    <path d="M106 39 115 34 125 39 115 44Z" fill="#f6faf7" />
    <path d="M106 39 115 44 115 47 106 42ZM115 44 125 39 125 42 115 47Z" fill="#b5cfd0" />
    <path d="M146 124 155 120 165 125 155 130Z" fill="#d9a65d" />
    <path d="M146 129 155 134 165 129M146 134 155 139 165 134" fill="none" stroke="#d9a65d" strokeWidth="4" />
  </>;
}

function Receivables() {
  return <>
    <path d="M43 88 101 57 156 84 100 115Z" fill="#f7faf8" />
    <path d="M43 88 100 115 100 142 43 114Z" fill="#dfebeb" />
    <path d="M100 115 156 84 156 112 100 142Z" fill="#a8c5c7" />
    <path d="M51 87 100 62 148 85 100 109Z" fill="#aecdd0" />
    <path d="M61 86 101 66 139 85 100 105Z" fill="#f4faf6" />
    <path d="M51 85 101 51 149 83 101 108Z" fill="#f9f8f1" stroke="#81a7b1" strokeWidth="1.5" />
    <path d="M73 78 101 59 126 76 100 94Z" fill="#e2eeeb" />
    <path d="M52 88 100 112 100 118 52 94ZM100 112 149 85 149 91 100 118Z" fill="#7eaab6" />
    <path d="M60 97 67 101 67 120 60 116ZM73 104 80 108 80 127 73 123ZM86 110 93 114 93 134 86 130Z" fill="#f9faf4" stroke="#9ebbc0" strokeWidth=".6" />
    <path d="M108 110 114 107 114 126 108 129ZM121 103 127 100 127 119 121 122ZM134 96 140 93 140 112 134 115Z" fill="#f9faf4" stroke="#9ebbc0" strokeWidth=".6" />
    <path d="M47 118 100 146 159 114 159 119 100 151 47 123Z" fill="#779fad" />
    <ellipse cx="147" cy="133" rx="12" ry="5" fill="#eebf72" />
    <path d="M135 132 147 138 159 132M135 137 147 143 159 137" fill="none" stroke="#ce9852" strokeWidth="4" />
    <path d="M135 132c0 3 6 5 12 5s12-2 12-5" fill="none" stroke="#ffe1a4" strokeWidth="1.5" />
  </>;
}

function Accounting() {
  return <>
    <path d="M62 56 101 36 140 55 101 76Z" fill="#f7faf9" stroke="#8cb1bb" strokeWidth="1.5" />
    <path d="M62 56 101 76 101 139 62 119Z" fill="#c7dcdf" />
    <path d="M101 76 140 55 140 118 101 139Z" fill="#8eafbb" />
    <path d="M70 68 96 81 96 95 70 82ZM70 91 96 104 96 118 70 105Z" fill="#75a9bb" />
    <path d="M106 81 132 67 132 81 106 95ZM106 104 132 90 132 104 106 118Z" fill="#d9eeee" />
    <path d="M75 76 91 84M75 99 91 107M111 86 127 78M111 109 127 101" stroke="#ebf9f7" strokeWidth="1.5" />
    <path d="M62 84 101 104 140 83M62 107 101 127 140 106" fill="none" stroke="#eaf5f3" strokeWidth="2" />
    <path d="M101 76 101 139" stroke="#f4fbf8" strokeWidth="1.5" />
    <path d="M57 119 101 142 145 118 145 122 101 147 57 124Z" fill="#6f9aab" />
    <path d="M127 126 144 117 155 123 138 132Z" fill="#fbfaf5" />
    <path d="M127 126 138 132 138 140 127 134ZM138 132 155 123 155 131 138 140Z" fill="#c9d9d8" />
    <path d="M132 128 140 132 150 127" fill="none" stroke="#4b8daf" strokeWidth="1.3" />
  </>;
}

function Report() {
  return <>
    <path d="M48 115 108 82 159 108 99 142Z" fill="#d4e4e3" />
    <path d="M48 115 99 142 99 149 48 122ZM99 142 159 108 159 115 99 149Z" fill="#89aeb9" />
    <path d="M58 103 86 88 135 111 106 127Z" fill="#b8cdd0" />
    <path d="M58 103 106 127 106 132 58 108ZM106 127 135 111 135 116 106 132Z" fill="#8aaab5" />
    <path d="M62 31 116 43 116 110 62 97Z" fill="#dcebed" />
    <path d="M70 26 125 38 125 106 70 94Z" fill="#f9fbf8" stroke="#91b3ba" strokeWidth="1.5" />
    <path d="M79 41 109 48M79 46 99 50" stroke="#9ab5bd" strokeWidth="2" strokeLinecap="round" />
    <path d="M80 82 80 65 86 66 86 83ZM90 84 90 58 96 59 96 85ZM100 86 100 68 106 69 106 87ZM110 89 110 55 116 56 116 90Z" fill="#63a5be" />
    <path d="M77 78 88 72 98 75 112 61" fill="none" stroke="#d3a75f" strokeWidth="2" />
    <path d="M77 91 116 99" stroke="#c4d7d7" strokeWidth="1.5" />
    <circle cx="139" cy="99" r="16" fill="#e3b86e" stroke="#fff5d8" strokeWidth="3" />
    <circle cx="139" cy="99" r="11" fill="#f9ebc5" />
    <path d="m133 99 4 4 8-9" fill="none" stroke="#9b723e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M133 114 131 132 139 128 147 136 145 113" fill="#d6a45d" />
  </>;
}

export default function WorkflowIllustration({ stage, accent }: { stage: StageKey; accent: string }) {
  return <svg viewBox="0 0 200 172" width="200" height="172" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg">
    <Platform accent={accent} />
    {stage === 'warehouse' && <Warehouse />}
    {stage === 'cost' && <Factory />}
    {stage === 'receivables' && <Receivables />}
    {stage === 'accounting' && <Accounting />}
    {stage === 'report' && <Report />}
  </svg>;
}
