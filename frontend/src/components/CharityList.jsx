import React from "react";

function CharityList({ charities, onSelect }) {
    return (
        <div className="charity-list">
            {charities.map(c => (
                <div key={c.id} className="charity-item" style={{ marginBottom: '10px' }}>
                    <div>
                        <b>{c.name}</b>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.description}</p>
                    </div>
                    <button className="select-btn" onClick={() => onSelect(c.id)}>Select</button>
                </div>
            ))}
            {charities.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No charities found.</p>}
        </div>
    );
}

export default CharityList;
