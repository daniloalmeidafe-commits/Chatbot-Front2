import { useQuery, useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query'
import api from '@/lib/axios'
import { toast } from 'react-toastify'

type ApiResponse<T> = { data: T }

export type CategoryEntity = {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
};

export type ImageEntity = {
    id: number;
    filename: string;
    url: string;
    createdAt: string;
    updatedAt: string;
    category: CategoryEntity;
};

export function useListCategories() {
    return useQuery<CategoryEntity[]>({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<CategoryEntity[]>>(
                '/api/v1/upload/categories',
            );
            return response.data.data;
        },
    });
}

export function useCreateCategory(): UseMutationResult<
    CategoryEntity,
    Error,
    { name: string }
> {
    const queryClient = useQueryClient();
    return useMutation<CategoryEntity, Error, { name: string }>({
        mutationFn: async ({ name }) => {
            const response = await api.post<ApiResponse<CategoryEntity>>(
                '/api/v1/upload/categories',
                { name },
            );
            return response.data.data;
        },
        onSuccess: () => {
            toast.success('Categoria criada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
        onError: () => {
            toast.error('Erro ao criar categoria.');
        },
    });
}

export function useDeleteCategory(): UseMutationResult<void, Error, number> {
    const queryClient = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await api.delete(`/api/v1/upload/categories/${id}`);
        },
        onSuccess: () => {
            toast.success('Categoria e imagens associadas excluídas!');
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['images'] });
        },
        onError: () => {
            toast.error('Erro ao excluir categoria.');
        },
    });
}

export function useListImages() {
    return useQuery<ImageEntity[]>({
        queryKey: ['images'],
        queryFn: async () => {
            const response = await api.get<ApiResponse<ImageEntity[]>>(
                '/api/v1/upload/images',
            );
            return response.data.data || [];
        },
    });
}

type UploadImageInput = {
    file: File;
    categoryId: number;
};

export function useUploadImage(): UseMutationResult<
    ImageEntity,
    Error,
    UploadImageInput
> {
    const queryClient = useQueryClient();
    return useMutation<ImageEntity, Error, UploadImageInput>({
        mutationFn: async ({ file, categoryId }: UploadImageInput) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('categoryId', String(categoryId));

            const resp = await api.post<ApiResponse<ImageEntity>>(
                '/api/v1/upload/image',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } },
            );
            return resp.data.data;
        },
        onSuccess: () => {
            toast.success('Imagem enviada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['images'] });
        },
        onError: () => {
            toast.error('Erro ao enviar imagem.');
        },
    });
}

export function useDeleteImage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (filename: string) => {
            await api.delete(`/api/v1/upload/image/${filename}`);
        },
        onSuccess: () => {
            toast.success('Imagem excluída com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['images'] });
        },
        onError: () => {
            toast.error('Erro ao excluir a imagem.');
        },
    });
}