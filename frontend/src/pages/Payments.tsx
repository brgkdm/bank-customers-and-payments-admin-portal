import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, CreditCard, AlertCircle, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import PaymentForm from '@/components/forms/PaymentForm';
import PaymentEditForm from '@/components/forms/PaymentEditForm';
import { paymentAPI, customerAPI } from '@/lib/api';
import { Payment } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Payments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

  const { data: payments, isLoading, error } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await paymentAPI.getAll();
      console.log('Payments API response:', response.data);
      return response.data;
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Hata',
        description: 'Ödeme verileri yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Create a query to fetch all customers to enable name-based search
  const { data: allCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerAPI.getAll();
      return response.data;
    },
  });

  const filteredPayments = payments?.filter((payment: Payment) => {
    // If no search query, show all payments
    if (!searchQuery.trim()) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // First, check if search matches customer number
    if (payment.musteriNo?.toString().includes(searchQuery)) {
      return true;
    }
    
    // Then, check customer name - first try embedded customer data
    let customerFirstName = '';
    let customerLastName = '';
    
    if (payment.musteri) {
      // Handle both camelCase (TypeScript) & PascalCase (API) property names
      customerFirstName = (payment.musteri.ad || (payment.musteri as any)?.Ad || '').toLowerCase();
      customerLastName = (payment.musteri.soyad || (payment.musteri as any)?.Soyad || '').toLowerCase();
    } else if (allCustomers && payment.musteriNo) {
      // Fallback: find customer in the customers list
      const customer = allCustomers.find((c: any) => c.musteriNo === payment.musteriNo);
      if (customer) {
        customerFirstName = (customer.ad || customer.Ad || '').toLowerCase();
        customerLastName = (customer.soyad || customer.Soyad || '').toLowerCase();
      }
    }
    
    // Filter by customer name if search query exists
    return customerFirstName.includes(searchLower) ||
           customerLastName.includes(searchLower);
  }) || [];

  console.log('Total payments:', payments?.length);
  console.log('Filtered payments:', filteredPayments?.length);
  console.log('Search query:', searchQuery);

  // Calculate statistics
  const stats = {
    total: payments?.length || 0,
    totalDebt: payments?.reduce((sum: number, p: Payment) => sum + (p.guncelBorcTutari || 0), 0) || 0,
    totalPaid: payments?.reduce((sum: number, p: Payment) => sum + (p.odenmisBorcTutari || 0), 0) || 0,
    overdue: payments?.reduce((sum: number, p: Payment) => sum + (p.gecikmisBorcTutari || 0), 0) || 0,
  };

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };

  const handleEditSuccess = () => {
    setEditingPayment(null);
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };

  const handleDelete = async (payment: Payment) => {
    try {
      await paymentAPI.delete(payment.odemeId!);
      toast({
        title: 'Başarılı',
        description: 'Ödeme kaydı başarıyla silindi.',
      });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setDeletingPayment(null);
    } catch (error) {
      console.error('Payment delete error:', error);
      toast({
        title: 'Hata',
        description: 'Ödeme silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  // Component to display customer name
  const CustomerName = ({ payment }: { payment: Payment }) => {
    const { data: customer } = useQuery({
      queryKey: ['customer', payment.musteriNo],
      queryFn: async () => {
        if (!payment.musteriNo) return null;
        const response = await customerAPI.getById(payment.musteriNo);
        return response.data;
      },
      enabled: !!payment.musteriNo && !payment.musteri,
    });

    if (payment.musteri) {
      return `${payment.musteri.ad} ${payment.musteri.soyad}`;
    }

    if (customer) {
      return `${customer.ad} ${customer.soyad}`;
    }

    return 'Müşteri Bilgisi Yok';
  };

  const columns = [
    {
      key: 'musteriNo',
      header: 'Müşteri No',
      className: 'font-medium text-foreground',
    },
    {
      key: 'musteri',
      header: 'Müşteri Adı',
      render: (payment: Payment) => <CustomerName payment={payment} />,
      className: 'font-medium text-foreground',
    },
    {
      key: 'guncelOdemeTutari',
      header: 'Güncel Ödeme',
      render: (payment: Payment) => 
        payment.guncelOdemeTutari ? `₺${payment.guncelOdemeTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-',
      className: 'font-semibold',
    },
    {
      key: 'guncelBorcTutari',
      header: 'Güncel Borç',
      render: (payment: Payment) => 
        payment.guncelBorcTutari ? `₺${payment.guncelBorcTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-',
      className: 'text-destructive font-medium',
    },
    {
      key: 'odenmisBorcTutari',
      header: 'Ödenmiş Borç',
      render: (payment: Payment) => 
        payment.odenmisBorcTutari ? `₺${payment.odenmisBorcTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-',
      className: 'text-success font-medium',
    },
    {
      key: 'gecikmisBorcTutari',
      header: 'Gecikmiş Borç',
      render: (payment: Payment) => 
        payment.gecikmisBorcTutari ? `₺${payment.gecikmisBorcTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-',
      className: 'text-warning font-medium',
    },
    {
      key: 'sonOdemeTarihi',
      header: 'Son Ödeme Tarihi',
      render: (payment: Payment) => 
        payment.sonOdemeTarihi ? new Date(payment.sonOdemeTarihi).toLocaleDateString('tr-TR') : '-',
      className: 'text-muted-foreground',
    },
    {
      key: 'actions',
      header: 'İşlemler',
      render: (payment: Payment) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingPayment(payment);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Ödeme Kaydını Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu ödeme kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(payment)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sil
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
      className: 'w-32',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Ödemeler</h1>
          <p className="text-muted-foreground">
            Müşteri ödemelerini takip edin ve yönetin
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:bg-primary-hover">
              <CreditCard className="mr-2 h-4 w-4" />
              Yeni Ödeme
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <PaymentForm
              onSuccess={handleAddSuccess}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Ödemeler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Borç
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ₺{stats.totalDebt.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Ödenmiş
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₺{stats.totalPaid.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gecikmiş Borçlar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              ₺{stats.overdue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Müşteri adı ile ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredPayments.length} ödeme bulundu
      </div>

      {/* Payments Table */}
      <DataTable
        data={filteredPayments}
        columns={columns}
        loading={isLoading}
        emptyMessage="Henüz ödeme kaydı bulunmuyor"
      />

      {/* Edit Payment Dialog */}
      <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {editingPayment && (
            <PaymentEditForm
              payment={editingPayment}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingPayment(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}