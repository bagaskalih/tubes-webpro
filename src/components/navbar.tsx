"use client";

import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useColorModeValue,
  useBreakpointValue,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Center,
  MenuDivider,
  Spacer,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@chakra-ui/icons";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface NavItem {
  label: string;
  subLabel?: string;
  children?: Array<NavItem>;
  href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
  {
    label: "Beranda",
    href: "/",
  },
  {
    label: "Layanan",
    href: "/layanan",
  },
  {
    label: "Artikel",
    href: "/artikel",
  },
  {
    label: "Forum",
    href: "/forum",
  },
  {
    label: "Konsultasi",
    href: "/konsultasi",
  },
];

export default function WithSubnavigation() {
  const { isOpen, onToggle } = useDisclosure();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleDashboard = async () => {
    if (session?.user.role === "EXPERT") {
      redirect("/expert/dashboard");
    } else if (session?.user.role === "USER") {
      redirect("/user/dashboard");
    } else if (session?.user.role === "ADMIN") {
      redirect("/admin/dashboard");
    }
  };

  const handleSettings = async () => {
    redirect("/settings");
  };

  return (
    <Box>
      <Flex minH={"72px"} py={4} align={"center"}>
        <Flex
          flex={{ base: 1, md: "auto" }}
          ml={{ base: -2 }}
          display={{ base: "flex", md: "none" }}
        >
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Link href="/" passHref>
          <Text
            fontSize={"xl"}
            fontWeight={"bold"}
            bgGradient="linear(to-r, pink.500, purple.500)"
            bgClip="text"
          >
            Portal Online Orangtua Pintar
          </Text>
        </Link>
        <Flex display={{ base: "none", md: "flex" }} ml={10}>
          <DesktopNav />
        </Flex>

        <Spacer />

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={"flex-end"}
          direction={"row"}
          spacing={6}
          align={"center"}
        >
          {session?.user ? (
            <Menu>
              <MenuButton
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
              >
                <Avatar
                  size={"sm"}
                  src={session.user.image || undefined}
                  ring={2}
                  ringColor="pink.400"
                />
              </MenuButton>
              <MenuList
                rounded={"xl"}
                shadow={"xl"}
                border={"none"}
                bg={"white"}
                overflow={"hidden"}
              >
                <Box px={4} pt={4} pb={2}>
                  <Avatar
                    size={"xl"}
                    src={session.user.image || undefined}
                    mb={4}
                  />
                  <Text fontWeight={"bold"} fontSize={"lg"}>
                    {session.user.name}
                  </Text>
                </Box>
                <MenuDivider />
                <MenuItem
                  icon={<Icon as={ChevronRightIcon} />}
                  onClick={handleDashboard}
                >
                  Dashboard
                </MenuItem>
                <MenuItem
                  icon={<Icon as={ChevronRightIcon} />}
                  onClick={handleSettings}
                >
                  Pengaturan Akun
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  color={"red.500"}
                  fontWeight={"medium"}
                  onClick={handleSignOut}
                >
                  Keluar
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <>
              <Button
                as={"a"}
                fontSize={"sm"}
                fontWeight={500}
                variant={"ghost"}
                href={"/signin"}
                color={"gray.600"}
                _hover={{
                  color: "pink.500",
                }}
              >
                Masuk
              </Button>
              <Button
                as={"a"}
                display={{ base: "none", md: "inline-flex" }}
                fontSize={"sm"}
                fontWeight={600}
                color={"white"}
                bg={"pink.400"}
                href={"/signup"}
                _hover={{
                  bg: "pink.500",
                }}
                rounded={"full"}
                px={6}
              >
                Daftar
              </Button>
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const linkColor = useColorModeValue("gray.600", "gray.200");
  const linkHoverColor = useColorModeValue("gray.800", "white");
  const popoverContentBgColor = useColorModeValue("white", "gray.800");

  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <Box
                as="a"
                p={2}
                href={navItem.href ?? "#"}
                fontSize={"sm"}
                fontWeight={500}
                color={linkColor}
                _hover={{
                  textDecoration: "none",
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={popoverContentBgColor}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Box
      as="a"
      href={href}
      role={"group"}
      display={"block"}
      p={2}
      rounded={"md"}
      _hover={{ bg: useColorModeValue("pink.50", "gray.900") }}
    >
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text
            transition={"all .3s ease"}
            _groupHover={{ color: "pink.400" }}
            fontWeight={500}
          >
            {label}
          </Text>
          <Text fontSize={"sm"}>{subLabel}</Text>
        </Box>
        <Flex
          transition={"all .3s ease"}
          transform={"translateX(-10px)"}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify={"flex-end"}
          align={"center"}
          flex={1}
        >
          <Icon color={"pink.400"} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Box>
  );
};

const MobileNav = () => {
  return (
    <Stack
      bg={useColorModeValue("white", "gray.800")}
      p={4}
      display={{ md: "none" }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Box
        py={2}
        as="a"
        href={href ?? "#"}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          color={useColorModeValue("gray.600", "gray.200")}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Box>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          mt={2}
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={useColorModeValue("gray.200", "gray.700")}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <Box as="a" key={child.label} py={2} href={child.href}>
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};
