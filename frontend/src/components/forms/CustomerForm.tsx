import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { customerAPI } from '@/lib/api';
import { CustomerCreateUpdateDto } from '@/types';

const customerSchema = z.object({
  ad: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  soyad: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  telefon: z.string().min(10, 'Telefon numarası en az 10 karakter olmalıdır'),
  sube: z.string().min(1, 'Şube seçiniz'),
  krediNotu: z.number().min(0).max(1000, 'Kredi notu 0-1000 arasında olmalıdır'),
  cinsiyet: z.string().min(1, 'Cinsiyet seçiniz'),
  dogumTarihi: z.string().min(1, 'Doğum tarihi gereklidir'),
  krediTutari: z.number().min(0, 'Kredi tutarı 0 veya daha büyük olmalıdır'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  customer?: CustomerCreateUpdateDto;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CustomerForm({ customer, onSuccess, onCancel }: CustomerFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const isEditing = !!customer;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer ? {
      ad: customer.ad,
      soyad: customer.soyad,
      telefon: customer.telefon,
      sube: customer.sube,
      krediNotu: customer.krediNotu,
      cinsiyet: customer.cinsiyet,
      dogumTarihi: customer.dogumTarihi.split('T')[0], // Convert to date input format
      krediTutari: customer.krediTutari,
    } : {
      ad: '',
      soyad: '',
      telefon: '',
      sube: '',
      krediNotu: 500,
      cinsiyet: '',
      dogumTarihi: '',
      krediTutari: 0,
    },
  });

  const onSubmit = async (data: CustomerFormData) => {
    setIsLoading(true);
    try {
      const formData: CustomerCreateUpdateDto = {
        ad: data.ad,
        soyad: data.soyad,
        telefon: data.telefon,
        sube: data.sube,
        krediNotu: data.krediNotu,
        cinsiyet: data.cinsiyet,
        krediTutari: data.krediTutari,
        dogumTarihi: new Date(data.dogumTarihi).toISOString(),
        kayitTarihi: isEditing ? customer!.kayitTarihi : new Date().toISOString(),
      };

      if (isEditing) {
        await customerAPI.update(customer.musteriNo!, formData);
        toast({
          title: 'Başarılı',
          description: 'Müşteri bilgileri güncellendi',
        });
      } else {
        await customerAPI.create(formData);
        toast({
          title: 'Başarılı',
          description: 'Yeni müşteri eklendi',
        });
      }
      
      onSuccess();
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: error.response?.data || 'İşlem sırasında bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-foreground">
          {isEditing ? 'Müşteri Bilgilerini Güncelle' : 'Yeni Müşteri Ekle'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ad">Ad</Label>
              <Input
                id="ad"
                {...register('ad')}
                placeholder="Müşteri adı"
              />
              {errors.ad && (
                <p className="text-sm text-destructive mt-1">{errors.ad.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="soyad">Soyad</Label>
              <Input
                id="soyad"
                {...register('soyad')}
                placeholder="Müşteri soyadı"
              />
              {errors.soyad && (
                <p className="text-sm text-destructive mt-1">{errors.soyad.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                {...register('telefon')}
                placeholder="05XX XXX XX XX"
              />
              {errors.telefon && (
                <p className="text-sm text-destructive mt-1">{errors.telefon.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="sube">Şube</Label>
              <Select onValueChange={(value) => setValue('sube', value)} defaultValue={watch('sube')}>
                <SelectTrigger>
                  <SelectValue placeholder="Şube seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ankara">Ankara</SelectItem>
                  <SelectItem value="İstanbul">İstanbul</SelectItem>
                  <SelectItem value="İzmir">İzmir</SelectItem>
                  <SelectItem value="Bursa">Bursa</SelectItem>
                  <SelectItem value="Antalya">Antalya</SelectItem>
                </SelectContent>
              </Select>
              {errors.sube && (
                <p className="text-sm text-destructive mt-1">{errors.sube.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cinsiyet">Cinsiyet</Label>
              <Select onValueChange={(value) => setValue('cinsiyet', value)} defaultValue={watch('cinsiyet')}>
                <SelectTrigger>
                  <SelectValue placeholder="Cinsiyet seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Erkek">Erkek</SelectItem>
                  <SelectItem value="Kadın">Kadın</SelectItem>
                </SelectContent>
              </Select>
              {errors.cinsiyet && (
                <p className="text-sm text-destructive mt-1">{errors.cinsiyet.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="dogumTarihi">Doğum Tarihi</Label>
              <Input
                id="dogumTarihi"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                {...register('dogumTarihi')}
              />
              {errors.dogumTarihi && (
                <p className="text-sm text-destructive mt-1">{errors.dogumTarihi.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="krediNotu">Kredi Notu</Label>
              <Input
                id="krediNotu"
                type="number"
                {...register('krediNotu', { valueAsNumber: true })}
                placeholder="500"
                min="0"
                max="1000"
              />
              {errors.krediNotu && (
                <p className="text-sm text-destructive mt-1">{errors.krediNotu.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="krediTutari">Kredi Tutarı</Label>
              <Input
                id="krediTutari"
                type="number"
                step="0.01"
                {...register('krediTutari', { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
              />
              {errors.krediTutari && (
                <p className="text-sm text-destructive mt-1">{errors.krediTutari.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              İptal
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary">
              {isLoading ? 'İşleniyor...' : isEditing ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}