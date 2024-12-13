"use client";

import React from "react";
import {
  Button,
  Input,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
} from "@chakra-ui/react";
import { Search2Icon } from "@chakra-ui/icons";

export const SearchBar = () => {
  return (
    <>
      <InputGroup borderRadius={5} size="sm">
        <InputLeftAddon>
          <Search2Icon />
        </InputLeftAddon>
        <Input type="text" placeholder="Search..." border="1px solid #949494" />
        <InputRightAddon p={0} border="none">
          <Button
            size="sm"
            borderLeftRadius={0}
            borderRightRadius={3.3}
            border="1px solid #949494"
          >
            Search
          </Button>
        </InputRightAddon>
      </InputGroup>
    </>
  );
};
