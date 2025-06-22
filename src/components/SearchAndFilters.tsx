
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
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar por nome, cargo ou matrícula..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-4 h-4" />
          <Select value={filterTag} onValueChange={onFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas as tags</SelectItem>
              {availableTags.sort().map(tag => (
                <SelectItem key={tag} value={tag}>
                  {tag}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {(searchTerm || filterTag) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSearchChange('');
                onFilterChange('');
              }}
              className="gap-1"
            >
              <X className="w-3 h-3" />
              Limpar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
