import { Button, Flex, Icon, Image, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import Folder from "Assets/icons/folder.svg";
import { DeleteIcon } from "@chakra-ui/icons";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase/clientApp";

type DocUploadProps = {
    selectedDoc: string[]; // Menyimpan URL file
    setSelectedDoc: (value: string[]) => void;
    selectDocRef: React.RefObject<HTMLInputElement>;
    onSelectDoc?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  };
  
  const DocUpload: React.FC<DocUploadProps> = ({
    selectedDoc,
    setSelectedDoc,
    selectDocRef,
}) => {
    const [uploading, setUploading] = useState(false);

    const handleSelectDoc = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
        const storageRef = ref(storage, `documents/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            "state_changed",
            null,
            (error) => {
            console.error("Upload failed", error);
            setUploading(false);
            },
            async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setSelectedDoc([...selectedDoc, downloadURL]);
            setUploading(false);
            }
        );
        } catch (error) {
        console.error("Error uploading document:", error);
        setUploading(false);
        }
    };

    const handleDeleteDoc = (index: number) => {
        const newDoc = [...selectedDoc];
        newDoc.splice(index, 1);
        setSelectedDoc(newDoc);
    };

    return (
        <Flex direction="column" justifyContent="space-between" gap={2} alignItems={'stretch'}>
            {selectedDoc.map((selectedDoc, index) => (
                <Flex justifyContent="space-between" >
                    <Flex
                        key={index}
                        direction="row"
                        maxWidth="270px"
                        maxHeight="32px"
                        width="100%"
                        height="100%"
                        bg="#E5FFE4"
                        borderRadius="4px"
                        border="1px solid #347357"
                        paddingRight={2}
                        paddingLeft={2}
                        gap={4}
                        position="relative"

                    >
                        <Text
                            margin={1}
                            fontSize="sm"
                            color="gray.800"
                            maxWidth="95%" /* Batasi lebar agar tidak melebihi Flex */
                            whiteSpace="nowrap" /* Pastikan teks tidak membungkus */
                            textOverflow="ellipsis" /* Tambahkan ellipsis untuk teks terpotong */
                            overflow="hidden"

                        >
                            {decodeURIComponent(selectedDoc.split("/").pop() || "Dokumen")}
                        </Text>

                    </Flex>
                    <Button
                        bg="red.500"
                        _hover={{ bg: "red.600" }}
                        width="32px"
                        height="32px"
                        variant="solid"
                        size="md"
                        onClick={() => handleDeleteDoc(index)}
                    >
                        <DeleteIcon />
                    </Button>
                </Flex>
            ))}

            {
                selectedDoc.length < 3 && (
                    <Button
                        leftIcon={<img src={Folder} alt="folder" />}
                        _hover={{ bg: "DBFFE6" }}
                        size='xs'
                        variant='outline'
                        display="flex"
                        maxWidth="126px"
                        width="100%"
                        border="2px"
                        cursor="pointer"
                        borderRadius="4px"
                        borderColor="#347357"
                        onClick={() => selectDocRef.current?.click()}
                        fontSize="10pt" color="#347357" fontWeight="400"
                        justifyContent="left"
                        isLoading={uploading}
                    >
                        Pilih Dokumen
                        <input
                            id="file-upload"
                            type="file"
                            hidden
                            accept=".pdf,.doc,.docx"
                            ref={selectDocRef}
                            onChange={handleSelectDoc}
                        />
                    </Button>
                )
            }
        </Flex >
    );
};
export default DocUpload;

// <Icon as={AddIcon} color="gray.300" fontSize="16px" />