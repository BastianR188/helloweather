import React, { useState } from "react";

function SearchBar({ onSearch }) {
    const [query, setCity] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
        setCity('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input 
            type="text"
            value={query}
            onChange={(e) => setCity(e.target.value)}
            placeholder="PLZ oder Stadt eingeben..."
            />
            <button type="submit">Suchen</button>
        </form>
    )
}

export default SearchBar