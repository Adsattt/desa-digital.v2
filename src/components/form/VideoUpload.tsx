import { Button, Flex, Spinner, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { DeleteIcon } from "@chakra-ui/icons";
import Video from "Assets/icons/video-camera.svg";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../firebase/clientApp";


type VidUploadProps = {
    selectedVid: string; // Menyimpan URL video
    setSelectedVid: (value: string) => void;
    selectVidRef: React.RefObject<HTMLInputElement>;
    onSelectVid?: (event: React.ChangeEvent<HTMLInputElement>) => void; 
  };
  
  const VidUpload: React.FC<VidUploadProps> = ({
    selectedVid,
    setSelectedVid,
    selectVidRef,
  }) => {
    const [uploading, setUploading] = useState(false);

    const handleSelectVid = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
    
        setUploading(true);
    
        try {
          const storageRef = ref(storage, `videos/${file.name}`);
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
              setSelectedVid(downloadURL);
              setUploading(false);
            }
          );
        } catch (error) {
          console.error("Error uploading video:", error);
          setUploading(false);
        }
      };
    
      const handleDeleteVid = () => {
        setSelectedVid("");
      };
    
    return (
        <Flex justifyContent="space-between" >
            {selectedVid ? (
                <>
                    <Flex
                        direction="row"
                        justifyContent="space-between"
                        maxWidth="270px"
                        maxHeight="32px"
                        height="100%"
                        width="100%"
                        bg="#E5FFE4"
                        borderRadius="4px"
                        border="1px solid #347357"
                        paddingRight={2}
                        paddingLeft={2}
                        gap={4}
                        position="relative"

                    >
                        {/* Menampilkan nama file */}
                        <Text
                            margin={1}
                            fontSize="sm"
                            color="gray.800"
                            maxWidth="95%" /* Batasi lebar agar tidak melebihi Flex */
                            whiteSpace="nowrap" /* Pastikan teks tidak membungkus */
                            textOverflow="ellipsis" /* Tambahkan ellipsis untuk teks terpotong */
                            overflow="hidden"
                        >
                            {decodeURIComponent(selectedVid.split("/").pop() || "Video")}
                        </Text>

                    </Flex>
                    <Button
                        bg="red.500"
                        _hover={{ bg: "red.600" }}
                        width="32px"
                        height="32px"
                        variant="solid"
                        size="md"
                        onClick={handleDeleteVid}
                    >
                        <DeleteIcon />
                    </Button>
                </>
            ) : (
                <Button
                    leftIcon={<img src={Video} alt="video" />}
                    _hover={{ bg: "DBFFE6" }}
                    size='xs'
                    variant='outline'
                    display="flex"
                    maxWidth="106px"
                    width="100%"
                    border="2px"
                    cursor="pointer"
                    borderRadius="4px"
                    borderColor="#347357"
                    onClick={() => selectVidRef.current?.click()}
                    fontSize="10pt" color="#347357" fontWeight="400"
                    justifyContent="left"
                    isDisabled={uploading}
                >
                    Pilih Video
                    <input
                        id="file-upload"
                        type="file"
                        hidden
                        accept="video/mp4"
                        ref={selectVidRef}
                        onChange={handleSelectVid}
                    />
                </Button>
            )}
        </Flex>
    );
};
export default VidUpload;

// <Icon as={AddIcon} color="gray.300" fontSize="16px" />