import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { paymentAPI, customerAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Payment } from '@/types';

const paymentEditSchema = z.object({
  musteriNo: z.number().min(1, 'Müşteri seçiniz'),
  guncelOdemeTutari: z.number().min(0, 'Güncel ödeme tutarı 0 veya daha büyük olmalıdır'),
  guncelBorcTutari: z.number().min(0, 'Güncel borç tutarı 0 veya daha büyük olmalıdır'),
  gecikmisBorcTutari: z.number().min(0, 'Gecikmiş borç tutarı 0 veya daha büyük olmalıdır'),
  odenmisBorcTutari: z.number().min(0, 'Ödenmiş borç tutarı 0 veya daha büyük olmalıdır'),
  sonOdemeTarihi: z.date().optional(),
});

type PaymentEditFormValues = z.infer<typeof paymentEditSchema>;

interface PaymentEditFormProps {
  payment: Payment;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentEditForm({ payment, onSuccess, onCancel }: PaymentEditFormProps) {
  const { toast } = useToast();

  const form = useForm<PaymentEditFormValues>({
    resolver: zodResolver(paymentEditSchema),
    defaultValues: {
      musteriNo: payment.musteriNo || 0,
      guncelOdemeTutari: payment.guncelOdemeTutari || 0,
      guncelBorcTutari: payment.guncelBorcTutari || 0,
      gecikmisBorcTutari: payment.gecikmisBorcTutari || 0,
      odenmisBorcTutari: payment.odenmisBorcTutari || 0,
      sonOdemeTarihi: payment.sonOdemeTarihi ? new Date(payment.sonOdemeTarihi) : undefined,
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await customerAPI.getAll();
      return response.data;
    },
  });

  const onSubmit = async (values: PaymentEditFormValues) => {
    try {
      const paymentData = {
        odemeId: payment.odemeId,
        musteriNo: values.musteriNo,
        guncelOdemeTutari: values.guncelOdemeTutari,
        guncelBorcTutari: values.guncelBorcTutari,
        gecikmisBorcTutari: values.gecikmisBorcTutari,
        odenmisBorcTutari: values.odenmisBorcTutari,
        sonOdemeTarihi: values.sonOdemeTarihi ? format(values.sonOdemeTarihi, 'yyyy-MM-dd') : null,
      };

      await paymentAPI.update(payment.odemeId!, paymentData);
      
      toast({
        title: 'Başarılı',
        description: 'Ödeme bilgileri başarıyla güncellendi.',
      });
      
      onSuccess();
    } catch (error) {
      console.error('Payment update error:', error);
      toast({
        title: 'Hata',
        description: 'Ödeme güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Ödeme Düzenle</h2>
        <p className="text-sm text-muted-foreground">
          Ödeme bilgilerini güncelleyin
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <FormField
              control={form.control}
              name="musteriNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Müşteri</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Müşteri seçiniz" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers?.map((customer: any) => (
                        <SelectItem 
                          key={customer.musteriNo} 
                          value={customer.musteriNo.toString()}
                        >
                          {customer.ad} {customer.soyad} ({customer.musteriNo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Payment Amount */}
            <FormField
              control={form.control}
              name="guncelOdemeTutari"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Güncel Ödeme Tutarı (₺)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Debt Amount */}
            <FormField
              control={form.control}
              name="guncelBorcTutari"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Güncel Borç Tutarı (₺)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Overdue Debt Amount */}
            <FormField
              control={form.control}
              name="gecikmisBorcTutari"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gecikmiş Borç Tutarı (₺)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Paid Debt Amount */}
            <FormField
              control={form.control}
              name="odenmisBorcTutari"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ödenmiş Borç Tutarı (₺)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Payment Date */}
            <FormField
              control={form.control}
              name="sonOdemeTarihi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Son Ödeme Tarihi</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "dd.MM.yyyy")
                          ) : (
                            <span>Tarih seçiniz</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              İptal
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-primary hover:bg-primary-hover"
            >
              Güncelle
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}