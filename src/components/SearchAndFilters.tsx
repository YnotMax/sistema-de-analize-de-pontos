
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterTag: string;
  onFilterChange: (tag: string) => void;
  availableTags: string[];
}

export const SearchAndFilters = ({
  searchTerm,
  onSearchChange,
  filterTag,
  onFilterChange,
  availableTags
}: SearchAndFiltersProps) => {
  const handleFilterChange = (value: string) => {
    // Convert "all" back to empty string for the parent component
    onFilterChange(value === "all" ? "" : value);
  };

  const handleClear = () => {
    onSearchChange('');
    onFilterChange('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          placeholder="Buscar colaborador..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 rounded-xl bg-white/50 border-slate-200 shadow-sm"
        />
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 mb-1">
          <Filter className="w-4 h-4" />
          Filtrar Ocorrências
        </div>
        <Select value={filterTag || "all"} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full rounded-xl bg-white/50 border-slate-200 shadow-sm">
            <SelectValue placeholder="Filtrar por tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as ocorrências</SelectItem>
            {availableTags.sort().map(tag => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {(searchTerm || filterTag) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="w-full gap-2 mt-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
          >
            <X className="w-4 h-4" />
            Limpar Filtros
          </Button>
        )}
      </div>
    </div>
  );
};
