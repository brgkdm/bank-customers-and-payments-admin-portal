import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, CreditCard, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import Layout from '@/components/layout/Layout';
import CustomerForm from '@/components/forms/CustomerForm';
import PaymentForm from '@/components/forms/PaymentForm';
import { customerAPI, paymentAPI } from '@/lib/api';
import { Customer, Payment } from '@/types';
import { useState, useEffect } from 'react';

const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Fetch dashboard data
  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerAPI.getAll();
      return response.data;
    },
  });

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const response = await paymentAPI.getAll();
      return response.data;
    },
  });

  // Calculate statistics
  const customerStats = {
    total: customers?.length || 0,
    // Remove active count since aktif field doesn't exist in new API
  };

  const paymentStats = {
    total: payments?.length || 0,
    totalDebt: payments?.reduce((sum: number, p: Payment) => sum + (p.guncelBorcTutari || 0), 0) || 0,
    totalPaid: payments?.reduce((sum: number, p: Payment) => sum + (p.odenmisBorcTutari || 0), 0) || 0,
    totalOverdue: payments?.reduce((sum: number, p: Payment) => sum + (p.gecikmisBorcTutari || 0), 0) || 0,
  };

  const recentPayments = payments?.sort((a, b) => new Date(b.sonOdemeTarihi || 0).getTime() - new Date(a.sonOdemeTarihi || 0).getTime()).slice(0, 5) || [];

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

  const handleAddSuccess = () => {
    setShowAddDialog(false);
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const handlePaymentSuccess = () => {
    setShowPaymentDialog(false);
    queryClient.invalidateQueries({ queryKey: ['payments'] });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground">
        <h1 className="text-3xl font-bold mb-2">Müşteri ve Ödeme Yönetimi</h1>
        <p className="text-primary-foreground/90">
          Müşterilerinizi ve ödemelerinizi kolayca takip edin
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Kayıtlı müşteri sayısı
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Toplam ödeme kaydı
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tutar</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" className="h-4 w-4 text-muted-foreground"><path d="M96 32C113.7 32 128 46.33 128 64V99.29L247.2 65.23C264.2 60.38 281.9 70.22 286.8 87.21C291.6 104.2 281.8 121.9 264.8 126.8L128 165.9V195.3L247.2 161.2C264.2 156.4 281.9 166.2 286.8 183.2C291.6 200.2 281.8 217.9 264.8 222.8L128 261.9V416H191.8C260 416 316.2 362.5 319.6 294.4L320 286.4C320.9 268.8 335.9 255.2 353.6 256C371.2 256.9 384.8 271.9 383.1 289.6L383.6 297.6C378.5 399.8 294.1 480 191.8 480H96C78.33 480 64 465.7 64 448V280.1L40.79 286.8C23.8 291.6 6.087 281.8 1.232 264.8C-3.623 247.8 6.217 230.1 23.21 225.2L64 213.6V184.1L40.79 190.8C23.8 195.6 6.087 185.8 1.232 168.8C-3.623 151.8 6.216 134.1 23.21 129.2L64 117.6V64C64 46.33 78.33 32 96 32L96 32z"/>
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{paymentStats.totalPaid.toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Toplam ödenmiş tutar
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kalan Borç</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ₺{paymentStats.totalDebt.toLocaleString('tr-TR')}
            </div>
            <p className="text-xs text-muted-foreground">
              ₺{paymentStats.totalOverdue.toLocaleString('tr-TR')} gecikmiş
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Müşteri Yönetimi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Müşteri kayıtlarını görüntüleyin, düzenleyin ve yönetin.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/customers')} className="flex-1">
                Müşterileri Görüntüle
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
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
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ödeme Yönetimi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Ödemeleri takip edin, kısmi ödemeler yapın ve borçları yönetin.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/payments')} className="flex-1">
                Ödemeleri Görüntüle
              </Button>
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Yeni Ödeme
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPaymentDialog(false)}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Son Ödemeler
            </span>
            <Button variant="ghost" size="sm" onClick={() => navigate('/payments')}>
              Tümünü Gör
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Henüz ödeme kaydı bulunmuyor
            </p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map((payment: Payment) => (
                <div key={payment.odemeId} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                  <div>
                    <div className="font-medium">
                      <CustomerName payment={payment} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Borç: ₺{(payment.guncelBorcTutari || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={payment.odenmisBorcTutari && payment.odenmisBorcTutari > 0 ? 'default' : 'secondary'}>
                      {payment.odenmisBorcTutari && payment.odenmisBorcTutari > 0 ? 'Ödenmiş' : 'Beklemede'}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      {payment.sonOdemeTarihi ? new Date(payment.sonOdemeTarihi).toLocaleDateString('tr-TR') : 'Henüz ödeme yok'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
