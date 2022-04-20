import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function Search(str) {
    const onSearchClick = (e) => {
        //? show dialog
        console.log("Dont search!!");
        setShowDialog(true);
    };
    const [showDialog, setShowDialog] = useState(false);
    const [searchResult, setSearchResult] = useState([{ title: "TEST" }]);
    function closeModal() {
        setShowDialog(false)
    }

    function openModal() {
        setShowDialog(true)
    }
    return (
        <>
            <div className="search cursor-pointer">
                <svg onClick={onSearchClick} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

            </div>
            <Transition appear show={showDialog} as={Fragment}>
                <Dialog open={showDialog} onClose={closeModal} as="div" className="fixed flex justify-center inset-0 z-10 overflow-y-auto">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0" />
                    </Transition.Child>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="inline-block w-full h-full p-6 overflow-hidden text-left transition-all transform bg-white">
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900"
                            >
                                Search article...
                            </Dialog.Title>
                            <div className="mt-2">
                                <input type="text" name="search" className="w-full h-12 border-4 border-indigo-200 text-lg" />
                            </div>

                            <div className="mt-4">
                                <button
                                    type="button"
                                    className="fixed bottom-20 w-48 inline-flex justify-center px-4 py-2 text-sm font-medium text-blue-900 bg-blue-100 border border-transparent rounded-md hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                    onClick={closeModal}
                                >
                                    Close it
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </Dialog>
            </Transition>
        </>
    )
}
