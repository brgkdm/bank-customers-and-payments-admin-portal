import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UserPlus, Filter, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CustomerForm from '@/components/forms/CustomerForm';
import { customerAPI } from '@/lib/api';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Customers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerAPI.getAll();
      return response.data;
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Hata',
        description: 'Müşteri verileri yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const handleSortToggle = () => {
    setSortOrder(current => {
      if (current === 'none') return 'asc';
      if (current === 'asc') return 'desc';
      return 'none';
    });
  };

  const filteredAndSortedCustomers = (() => {
    const filtered = customers?.filter((customer: Customer) =>
      customer.ad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.soyad.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.telefon.includes(searchQuery) ||
      customer.sube.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    if (sortOrder === 'none') return filtered;
    
    return [...filtered].sort((a, b) => {
      const diff = a.krediNotu - b.krediNotu;
      return sortOrder === 'asc' ? diff : -diff;
    });
  })();

  const columns = [
    {
      key: 'musteriNo',
      header: 'No',
      className: 'font-medium text-foreground',
    },
    {
      key: 'ad',
      header: 'Ad',
      className: 'font-medium text-foreground',
    },
    {
      key: 'soyad',
      header: 'Soyad',
      className: 'font-medium text-foreground',
    },
    {
      key: 'telefon',
      header: 'Telefon',
      className: 'text-muted-foreground',
    },
    {
      key: 'sube',
      header: 'Şube',
      className: 'text-muted-foreground',
    },
    {
      key: 'krediNotu',
      header: 'Kredi Notu',
      className: 'text-muted-foreground',
    },
    {
      key: 'krediTutari',
      header: 'Kredi Tutarı',
      render: (customer: Customer) => `₺${customer.krediTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
      className: 'font-semibold',
    },
    {
      key: 'kayitTarihi',
      header: 'Kayıt Tarihi',
      render: (customer: Customer) => 
        new Date(customer.kayitTarihi).toLocaleDateString('tr-TR'),
      className: 'text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Müşteriler</h1>
          <p className="text-muted-foreground">
            Tüm müşteri kayıtlarını görüntüleyin ve yönetin
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover">
              <UserPlus className="mr-2 h-4 w-4" />
              Yeni Müşteri
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <CustomerForm
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Ad, telefon veya şube ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" onClick={handleSortToggle}>
          {sortOrder === 'none' && <ArrowUpDown className="mr-2 h-4 w-4" />}
          {sortOrder === 'asc' && <ArrowUp className="mr-2 h-4 w-4" />}
          {sortOrder === 'desc' && <ArrowDown className="mr-2 h-4 w-4" />}
          {sortOrder === 'none' && 'Kredi Notu Sırala'}
          {sortOrder === 'asc' && 'Artan Sıralama'}
          {sortOrder === 'desc' && 'Azalan Sıralama'}
        </Button>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedCustomers.length} müşteri bulundu
      </div>

      {/* Customer Table */}
      <DataTable
        data={filteredAndSortedCustomers}
        columns={columns}
        onRowClick={(customer) => navigate(`/customers/${customer.musteriNo}`)}
        loading={isLoading}
        emptyMessage="Henüz müşteri kaydı bulunmuyor"
      />
    </div>
  );
}