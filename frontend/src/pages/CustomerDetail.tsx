import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Trash2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CustomerForm from '@/components/forms/CustomerForm';
import { customerAPI } from '@/lib/api';
import { Customer } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const response = await customerAPI.getById(Number(id));
      return response.data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: 'Hata',
        description: 'Müşteri bilgileri yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const handleDelete = async () => {
    if (!customer) return;
    
    setIsDeleting(true);
    try {
      await customerAPI.delete(customer.musteriNo);
      toast({
        title: 'Başarılı',
        description: 'Müşteri başarıyla silindi',
      });
      navigate('/customers');
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data || 'Silme işlemi sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditDialog(false);
    queryClient.invalidateQueries({ queryKey: ['customer', id] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  };

  const getCreditScoreInfo = (score: number) => {
    if (score >= 700) {
      return {
        text: 'İyi',
        className: 'bg-green-100 text-green-800 hover:bg-green-100'
      };
    } else if (score >= 500) {
      return {
        text: 'Orta', 
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-100'
      };
    } else {
      return {
        text: 'Düşük',
        className: 'bg-red-100 text-red-800 hover:bg-red-100'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-muted animate-pulse rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Müşteri bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/customers')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {customer.ad} {customer.soyad}
            </h1>
            <p className="text-muted-foreground">
              Müşteri No: {customer.musteriNo}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Düzenle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <CustomerForm
                customer={{
                  musteriNo: customer.musteriNo,
                  ad: customer.ad,
                  soyad: customer.soyad,
                  telefon: customer.telefon,
                  sube: customer.sube,
                  krediNotu: customer.krediNotu,
                  cinsiyet: customer.cinsiyet,
                  dogumTarihi: customer.dogumTarihi,
                  kayitTarihi: customer.kayitTarihi,
                  krediTutari: customer.krediTutari,
                }}
                onSuccess={handleEditSuccess}
                onCancel={() => setShowEditDialog(false)}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  {customer.ad} {customer.soyad} adlı müşteriyi silmek istediğinizden emin misiniz? 
                  Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeleting ? 'Siliniyor...' : 'Sil'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Kişisel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Ad</p>
                <p className="font-medium">{customer.ad}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Soyad</p>
                <p className="font-medium">{customer.soyad}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{customer.telefon}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cinsiyet</p>
                <p className="font-medium">{customer.cinsiyet}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Doğum Tarihi</p>
                <p className="font-medium">
                  {new Date(customer.dogumTarihi).toLocaleDateString('tr-TR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banka Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Şube</p>
              <p className="font-medium">{customer.sube}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kredi Notu</p>
              <div className="flex items-center gap-2">
                <p className="font-medium">{customer.krediNotu}</p>
                <Badge className={getCreditScoreInfo(customer.krediNotu).className}>
                  {getCreditScoreInfo(customer.krediNotu).text}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kredi Tutarı</p>
              <p className="font-medium">
                ₺{customer.krediTutari.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
              <p className="font-medium">
                {new Date(customer.kayitTarihi).toLocaleDateString('tr-TR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}