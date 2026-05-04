import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className="vk-search-bar">
    <input
      type="text"
      placeholder="Search products..."
      value={value}
      onChange={e => onChange(e.target.value)}
      className="vk-search-input"
    />
  </div>
);

export default SearchBar;
