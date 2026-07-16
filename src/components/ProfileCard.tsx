"use client";

import { useDeleteFacebookProfile } from "@/hooks/useFacebookProfiles";
import { useSweetAlert } from "@/utils/useSweetAlert";
import { Menu, Transition } from "@headlessui/react";
import { Library, MoreVertical, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { toast } from "react-toastify";

type Profile = {
  id: number;
  name: string;
  email: string;
  profileId: string;
  accessToken: string;
  projectId: number;
  pageCount: number;
};

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const router = useRouter();
  const { confirmDelete } = useSweetAlert();

  const deleteProfileMutation = useDeleteFacebookProfile(profile.projectId);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const confirm = await confirmDelete(
      "Deseja excluir este perfil e todas as suas páginas associadas?",
    );
    if (confirm) {
      deleteProfileMutation.mutate(profile.id, {
        onSuccess: () => toast.success("Perfil excluído com sucesso"),
      });
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 flex flex-col hover:border-blue-500 transition-all duration-200 group relative">
      <div className="absolute top-2 right-2 z-10">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="inline-flex justify-center rounded-full p-2 text-sm font-medium text-gray-400 hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
              <MoreVertical className="h-5 w-5" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-gray-800 shadow-lg ring-1 ring-black/5 focus:outline-none border border-gray-700">
              <div className="px-1 py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleDelete}
                      disabled={deleteProfileMutation.isPending}
                      className={`${
                        active ? "bg-red-800/50 text-red-300" : "text-red-400"
                      } group flex w-full items-center rounded-md px-2 py-2 text-sm disabled:opacity-50`}
                    >
                      <Trash2 className="mr-2 h-5 w-5" />
                      Excluir Perfil
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>

      <div
        onClick={() =>
          router.push(
            `/projects/${profile.projectId}/facebook-profiles/${profile.id}/pages`,
          )
        }
        className="p-4 pt-8 space-y-2 cursor-pointer flex-grow text-center flex flex-col justify-center items-center"
      >
        <Image
          src={`https://graph.facebook.com/${profile.profileId}/picture?type=large&access_token=${profile.accessToken}`}
          alt="Avatar"
          width={80}
          height={80}
          className="rounded-full mb-4 border-2 border-gray-600 group-hover:border-blue-500 transition-colors"
        />
        <h2 className="text-white font-semibold truncate w-full">
          {profile.name}
        </h2>
        <p className="text-sm text-gray-400 truncate w-full">{profile.email}</p>
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-2">
          <Library className="w-4 h-4 text-blue-400" />
          <span>Gerencia {profile.pageCount} página(s)</span>
        </div>
      </div>
    </div>
  );
}
